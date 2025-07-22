import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const resources = [];

/**
 * Register resources with the MCP server.
 * 
 * @param {McpServer} server 
 */
export default function registerResources(server) {
  resources.forEach((resource) => {
    const { name, uri, config, handler } = resource;

    server.registerResource(name, uri, config, handler);
  });
}