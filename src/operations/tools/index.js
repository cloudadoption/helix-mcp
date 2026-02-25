// eslint-disable-next-line no-unused-vars
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import createPageStatusTool from './page-status.js';
import createAuditLogTool from './audit-log.js';
import createRumDataTool from './rum-bundles.js';
import { createStartBulkStatusTool, createCheckBulkStatusTool } from './bulk-status.js';

/**
 * Register tools with the MCP server.
 *
 * @param {McpServer} server
 * @param {string} token
 */
export default function registerTools(server, token) {
  const tools = [
    createPageStatusTool(token),
    createStartBulkStatusTool(token),
    createCheckBulkStatusTool(token),
    createAuditLogTool(token),
    createRumDataTool(token),
  ];

  tools.forEach((tool) => {
    const { name, config, handler } = tool;
    server.registerTool(name, config, handler);
  });
}
