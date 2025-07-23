import { z } from 'zod';
import { wrapToolJSONResult, formatHelixAdminURL, helixAdminRequest } from '../../common/utils.js';
import { HELIX_ADMIN_API_URL } from '../../common/global.js';

async function fetchHosts(org, site) {
  try {
    const url = formatHelixAdminURL('status', org, site, 'main', '');
    const json = await helixAdminRequest(url)
    return {
      live: new URL(json.live.url).host,
      preview: new URL(json.preview.url).host,
    };
  } catch (error) {
    return {
      live: null,
      preview: null,
    };
  }
}

/**
 * Validates and normalizes path string.
 * @param {string} path - Path to validate and normalize.
 * @returns {string} Validated and normalized path.
 */
function validatePath(path) {
  if (!path) return '/*';
  let str = path;

  // ensure path starts with "/"
  str = str.startsWith('/') ? str : `/${str}`;

  // add path ends with "/*"
  if (!str.endsWith('/*')) {
    if (str.endsWith('/')) {
      str += '*';
    } else {
      str += '/*';
    }
  }
  
  return str;
}

function pad(number) {
  return number.toString().padStart(2, '0');
}

/**
 * Converts Date string to a formatted UTC date and time string.
 * @param {string} d - Date string.
 * @returns {string} UTC date and time in "MM/DD/YYYY HH:MM UTC" format.
 */
function toUTCDate(d) {
  const date = new Date(d);
  const dd = pad(date.getUTCDate());
  const mm = pad(date.getUTCMonth() + 1);
  const yyyy = date.getUTCFullYear();
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  return `${mm}/${dd}/${yyyy} ${hours}:${minutes}`;
}

function buildSequenceStatus(edit, preview, publish) {
  // check if a date is valid
  const date = (d) => !Number.isNaN(d.getTime());
  const editDate = new Date(edit);
  const previewDate = new Date(preview);
  const publishDate = new Date(publish);
  const inSequence = (editDate <= previewDate && previewDate <= publishDate);

  let status;
  if (!date(editDate)) {
    status = 'No source';
  } else if (date(editDate) && !date(previewDate) && !date(publishDate)) {
    status = 'Not previewed';
  } else if (
    date(editDate)
    && date(previewDate)
    && !date(publishDate)
    && editDate <= previewDate
  ) {
    status = 'Not published';
  } else {
    status = inSequence ? 'Current' : 'Pending changes';
  }
  
  return status;
}

function processPageStatus(data, preview, live) {
  const resources = data.resources.map((resource) => {
    const {
      path,
      sourceLastModified,
      previewLastModified,
      publishLastModified,
      publishConfigRedirectLocation,
      previewConfigRedirectLocation,
    } = resource;
    const ignore = ['/helix-env.json', '/sitemap.json'];
    if (path && !ignore.includes(path)) {
      const status = buildSequenceStatus(
        sourceLastModified,
        previewLastModified,
        publishLastModified,
      );

      return {
        path,
        isRedirect: !!(publishConfigRedirectLocation || previewConfigRedirectLocation),
        status,
        sourceLastModified: sourceLastModified ? toUTCDate(sourceLastModified) : 'n/a',
        previewLastModified: previewLastModified ? toUTCDate(previewLastModified) : 'n/a',
        previewLink: previewLastModified ? `https://${preview}${path}` : 'n/a',
        publishLastModified: publishLastModified ? toUTCDate(publishLastModified) : 'n/a',
        publishLink: publishLastModified ? `https://${live}${path}` : 'n/a',
      }
    }
    return null;
  }).filter((resource) => resource !== null);

  return {
    ...data,
    resources,
  };
}

export const startBulkStatusTool = {
  name: 'start-bulk-page-status',
  config: {
    title: 'Start Bulk Page Status',
    description: `
    <use_case>
      Use this tool to retrieve the status of all pages in a site, or a subset of pages in a site under a given path. The results will include information for when the pages
      were last published, previewed, and edited, as well as who performed those actions.

      This tool is asynchronous and will return a job ID. You can use the check-bulk-page-status tool to check the status of the job and retrieve results.
    </use_case>

    <important_notes>
      1. The org, site, branch, and path must be provided, ask the user for them if they are not provided.
      2. The org, site, branch, and path can be derived from the aem page URL. This is of the form: https://\${branch}--\${site}--\${org}.aem.live/\${path}
    </important_notes>
  `,
    inputSchema:{
      org: z.string().describe('The organization name'),
      site: z.string().describe('The site name'),
      branch: z.string().describe('The branch name').default('main'),
      path: z.string().describe('The start path of the pages to retrieve the status of').default('/'),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  handler: async ({ org, site, branch, path }) => {
    const url = formatHelixAdminURL('status', org, site, branch, '/*');

    const jobJson = await helixAdminRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paths: [validatePath(path)],
        select: ['edit', 'preview', 'live'],
        forceAsync: true,
      }),
    });

    if (!jobJson.job || jobJson.job.state !== 'created') {
      throw new Error('Failed to create bulk status job');
    }

    const jobId = jobJson.links.self.split('/job/').pop();

    return wrapToolJSONResult({
      name: jobJson.job.name,
      state: jobJson.job.state,
      created: jobJson.job.createTime,
      jobId,
    });
  },
};

export const checkBulkStatusTool = {
  name: 'check-bulk-page-status',
  config: {
    title: 'Check Bulk Page Status',
    description: `
    <use_case>
      Use this tool to check the status of a bulk page status job and get the results.
    </use_case>

    <important_notes>
      1. The job ID must be provided, ask the user for it not provided. You can get the job ID from the start-bulk-page-status tool.
    </important_notes>
  `,
    inputSchema:{
      jobId: z.string().describe('The job ID of the bulk page status job'),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  handler: async ({ jobId }) => {
    const url = `${HELIX_ADMIN_API_URL}/job/${jobId}/details`;

    const jobDetailsJson = await helixAdminRequest(url, {
      method: 'GET',
    });
    const state = jobDetailsJson.state;

    if (state !== 'completed' && state !== 'stopped') {
      return wrapToolJSONResult({
        name: jobDetailsJson.name,
        state: jobDetailsJson.state,
        created: jobDetailsJson.createTime,
        startTime: jobDetailsJson.startTime,
        jobId,
      });
    }

    const info = jobId.split('/');
    const org = info[0];
    const site = info[1];
    const { live, preview } = await fetchHosts(org, site);

    const data = processPageStatus(jobDetailsJson.data, preview, live);

    return wrapToolJSONResult({
      name: jobDetailsJson.name,
      state: jobDetailsJson.state,
      created: jobDetailsJson.createTime,
      startTime: jobDetailsJson.startTime,
      stopTime: jobDetailsJson.stopTime,
      jobId,
      data,
    });
  },
};
