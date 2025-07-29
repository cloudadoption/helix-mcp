import { z } from 'zod';
import { wrapToolJSONResult, formatHelixAdminURL, helixAdminRequest } from '../../common/utils.js';
import rumCollector from '../../common/rum.js';

const auditLogTool = {
  name: 'audit-log',
  config: {
    title: 'Audit Log',
    description: `
    <use_case>
      Use this tool to retrieve audit logs from the AEM Edge Delivery Services repository. The results will include detailed information about 
      repository activities and operations. The response contains a list of entries with the following information:
      
      - **timestamp**: Unix timestamp when the action occurred
      - **user**: Email address of the user who performed the action
      - **route**: Type of operation (e.g., "preview", "live", "job")
      - **method**: HTTP method used (e.g., "POST", "GET")
      - **path**: The specific resource path that was affected
      - **status**: HTTP status code of the operation result (e.g., 200, 404, 500)
      - **duration**: Time taken for the operation in milliseconds
      - **contentBusId**: Unique identifier for the content being processed
      - **org/site/repo/ref**: Repository and branch information
      - **job**: Job identifier (for job-related operations)
      
      Common route types include:
      - "preview": Content preview operations
      - "live": Live content publishing operations  
      - "job": Background job operations (publish, index, etc.)
      
      The response also includes "from" and "to" timestamps indicating the time range of the logs.
      
      **When to use this tool:**
      - You need to investigate system errors or failures
      - You want to see who performed specific actions and when
      - You're troubleshooting publishing or preview issues
      - You need to audit user activity and system operations
      - You want to monitor system performance (duration times)
      - You're debugging deployment or publishing problems
      - You need to track content changes over time
      - You want to verify if specific operations completed successfully
      - You're investigating slow performance or timeouts
      - You need to see the sequence of operations that occurred
      - You want to see if something was published or previewed
      
      **When NOT to use this tool:**
      - You need current page status information (use page-status or bulk-status tools)
      - You want to check if a page is published/previewed
      - You need to find pages with specific publishing states
      - You're looking for content information rather than system activity
    </use_case>

    <important_notes>
      1. The org, site, and branch must be provided, ask the user for them if they are not provided.
      2. The org, site, and branch can be derived from the aem page URL. This is of the form: https://\${branch}--\${site}--\${org}.aem.live/\${path}
      3. Time filtering parameters (from, to, since) are optional and can be used to limit the logs to specific timeframes.
      4. The 'since' parameter is a relative time (e.g., '1h', '24h', '7d') while 'from' and 'to' are absolute timestamps.
      5. Do not make up any information, only use the information that is provided in the response to answer the user's question.
    </important_notes>
  `,
    inputSchema: {
      org: z.string().describe('The organization name'),
      site: z.string().describe('The site name'),
      branch: z.string().describe('The branch name').default('main'),
      from: z.string().optional().describe('Start timestamp for filtering logs (ISO 8601 format)'),
      to: z.string().optional().describe('End timestamp for filtering logs (ISO 8601 format)'),
      since: z.string().regex(/^[0-9]+[hdm]$/).optional().describe('Relative time for filtering logs (e.g., "1h", "24h", "7d")'),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  handler: async ({ org, site, branch, from, to, since }) => {
    // Build the base URL for the logs endpoint
    const baseUrl = `${formatHelixAdminURL('log', org, site, branch, '').replace(/\/$/, '')}`;
    
    rumCollector.sampleRUMWithToolId('helix-mcp-audit-log', 'enter', { tool: 'audit-log', baseUrl, from, to, since });
    
    // Build query parameters for time filtering
    const queryParams = new URLSearchParams();
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (since) queryParams.append('since', since);
    
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;

    const response = await helixAdminRequest(url);

    return wrapToolJSONResult(response);
  },
};

export default auditLogTool;
