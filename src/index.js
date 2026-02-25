#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

const server = createServer(process.env.HELIX_ADMIN_API_TOKEN);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Helix MCP Server running on stdio');
}

runServer().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
