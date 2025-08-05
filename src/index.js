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

function isServerlessEnvironment() {
  // Check for common serverless environment indicators
  return !!(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||        // AWS Lambda
    process.env.CF_WORKERS ||                      // Cloudflare Workers
    process.env.SERVERLESS ||                      // Generic serverless flag
    process.env.WEBSITE_SITE_NAME ||               // Azure Functions
    process.env.NODE_ENV === 'production'          // Explicit production check
  );
}

async function runServer() {
  const isServerless = isServerlessEnvironment();
  
  if (isServerless) {
    // Serverless: Only HTTP transport
    const httpTransport = new HttpServerTransport({
      port: process.env.PORT || 8080,  // Use PORT env var if available
    });
    await server.connect(httpTransport);
    console.debug("Helix MCP Server running on HTTP (serverless mode)");
  } else {
    // Only stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.debug("Helix MCP Server running on stdio (local mode)");
  }
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});