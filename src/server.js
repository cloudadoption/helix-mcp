import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import registerTools from './operations/tools/index.js';
import registerResources from './operations/resources/index.js';
import registerResourceTemplates from './operations/resource-templates/index.js';
import registerPrompts from './operations/prompts/index.js';
import { VERSION } from './common/global.js';

export function createServer(token) {
  const server = new McpServer({
    name: 'helix-mcp-server',
    version: VERSION,
  });

  registerTools(server, token);
  registerResources(server);
  registerResourceTemplates(server);
  registerPrompts(server);

  return server;
}
