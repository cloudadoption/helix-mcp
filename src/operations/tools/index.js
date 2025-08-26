// eslint-disable-next-line no-unused-vars
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import pageStatusTool from './page-status.js';
import auditLogTool from './audit-log.js';
import rumDataTool from './rum-bundles.js';
import { startBulkStatusTool, checkBulkStatusTool } from './bulk-status.js';

const tools = [
  pageStatusTool,
  startBulkStatusTool,
  checkBulkStatusTool,
  auditLogTool,
  rumDataTool,
];

/**
 * Register tools with the MCP server.
 *
 * @param {McpServer} server
 */
export default function registerTools(server) {
  tools.forEach((tool) => {
    const { name, config, handler } = tool;
    server.registerTool(name, config, handler);
  });
}
