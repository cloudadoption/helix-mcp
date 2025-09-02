// eslint-disable-next-line no-unused-vars
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const prompts = [];

/**
 * Register prompts with the MCP server.
 *
 * @param {McpServer} server
 */
export default function registerPrompts(server) {
  prompts.forEach((prompt) => {
    const { name, config, handler } = prompt;
    server.registerPrompt(name, config, handler);
  });
}
