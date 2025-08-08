#!/usr/bin/env node
import { createServer } from 'node:http';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import registerTools from './operations/tools/index.js';
import registerResources from './operations/resources/index.js';
import registerResourceTemplates from './operations/resource-templates/index.js';
import { VERSION } from './common/global.js';

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

// Create the MCP server instance
const server = new McpServer({
  name: 'helix-mcp-server',
  version: VERSION,
});

// Register all operations
registerTools(server);
registerResources(server);
registerResourceTemplates(server);

// Create HTTP server
const httpServer = createServer(async (req, res) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
      });
      res.end();
      return;
    }

    // Add CORS headers to all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id');

    // Handle server reset endpoint (for testing)
    if (req.method === 'POST' && req.url === '/reset') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        message: 'Server state reset successfully' 
      }));
      return;
    }

    // Create a NEW transport instance for each request (stateless mode)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode - no session management
    });

    // Connect the server to the transport
    await server.connect(transport);

    // Handle the request through the MCP transport
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

// Start the server
httpServer.listen(port, host, () => {
  console.error(`Helix MCP Server running on HTTP at http://${host}:${port}`);
  console.error(`Server reset endpoint: POST http://${host}:${port}/reset`);
  console.error(`Mode: Stateless (no session management)`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down server...');
  httpServer.close(() => {
    console.error('Server closed');
    process.exit(0);
  });
});
