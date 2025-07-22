import { z } from 'zod';
import { wrapToolJSONResult, formatHelixAdminURL, helixAdminRequest } from '../../common/utils.js';

const pageStatusTool = {
  name: 'page-status',
  config: {
    title: 'Page Status',
    description: `
    <use_case>
      Use this tool to retrieve the status of a single page. The results will include information for when the page
      was last published, previewed, and edited, as well as who performed those actions.
    </use_case>

    <important_notes>
      1. Complete workflow: URL → getSiteByBaseURL → listScrapedContentFiles → getScrapedContentFileByKey
      2. The storage key must be obtained from listScrapedContentFiles first
      3. Keys are automatically URL-decoded to handle encoded characters
      4. Use the exact key returned from the file listing without modification
      5. For specific page content, look for keys that match the URL path you're interested in
    </important_notes>
  `,
    inputSchema:{
      org: z.string().describe('The organization name'),
      site: z.string().describe('The site name'),
      branch: z.string().describe('The branch name').default('main'),
      path: z.string().describe('The path of the page'),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  handler: async ({ org, site, branch, path }) => {
    const url = formatHelixAdminURL('status', org, site, branch, path);

    const response = await helixAdminRequest(url);

    return wrapToolJSONResult(response);
  },
};

export default pageStatusTool;