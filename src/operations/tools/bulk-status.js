import { z } from 'zod';
import { wrapToolJSONResult, formatHelixAdminURL, helixAdminRequest } from '../../common/utils.js';

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

const pageStatusTool = {
  name: 'bulk-page-status',
  config: {
    title: 'Bulk Page Status',
    description: `
    <use_case>
      Use this tool to retrieve the status of all pages in a site, or a subset of pages in a site under a given path. The results will include information for when the pages
      were last published, previewed, and edited, as well as who performed those actions.
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
      readOnlyHint: true,
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

    const statusUrl = jobJson.links.self;

    const statusResult = await new Promise((resolve, reject) => {
      let maxChecks = 10;
      const checkStatus = async () => {
        const statusJson = await helixAdminRequest(statusUrl);
        if (statusJson.state === 'stopped') {
          const details = await helixAdminRequest(statusJson.links.details);
          resolve(details);
        } else if (statusJson.state === 'failed') {
          reject(new Error('Bulk status job failed'));
        } 
        maxChecks -= 1;
        if (maxChecks <= 0) {
          reject(new Error('Bulk status job timed out'));
        }
      };

      setInterval(checkStatus, 1000);
    });

    return wrapToolJSONResult(statusResult);
  },
};

export default pageStatusTool;