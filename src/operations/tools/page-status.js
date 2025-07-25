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
      1. The org, site, branch, and path must be provided, ask the user for them if they are not provided.
      2. The org, site, branch, and path can be derived from the aem page URL. This is of the form: https://\${branch}--\${site}--\${org}.aem.live/\${path}
      3. Do not make up any information, only use the information that is provided in the response to answer the user's question.
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
      idempotentHint: false,
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