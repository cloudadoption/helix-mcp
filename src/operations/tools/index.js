import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import echoTool from './echo.js';

const tools = [ 
  echoTool,
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