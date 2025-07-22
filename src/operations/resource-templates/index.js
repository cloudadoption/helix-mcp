import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const resourceTemplates = [];

/**
 * Register resources with the MCP server.
 * 
 * @param {McpServer} server 
 */
export default function registerResourceTemplates(server) {
  resourceTemplates.forEach((resourceTemplate) => {
    const { name, template, config, handler } = resourceTemplate;

    server.registerResource(name, template, config, handler);
  });
}