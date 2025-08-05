#!/usr/bin/env node
import { McpServer, } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";
import registerTools from './operations/tools/index.js';
import registerResources from './operations/resources/index.js';
import registerResourceTemplates from './operations/resource-templates/index.js';

import { VERSION } from './common/global.js';

const server = new McpServer(
  {
    name: 'helix-mcp-server',
    version: VERSION,
  }
);

registerTools(server);
registerResources(server);
registerResourceTemplates(server);

async function runServer() {
  const transport = new StdioServerTransport();
  const httpTransport = new HttpServerTransport({
    port: 8080,
  });
  await server.connect(transport);
  await server.connect(httpTransport);
  console.error("Helix MCP Server running on stdio");
  console.error("Helix MCP Server running on http");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});