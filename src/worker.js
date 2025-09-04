import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import registerTools from './operations/tools/index.js';
import registerResources from './operations/resources/index.js';
import registerResourceTemplates from './operations/resource-templates/index.js';
import { VERSION } from './common/global.js';

// Create the MCP server instance
const server = new McpServer({
  name: 'helix-mcp-server',
  version: VERSION,
});

// Register all operations
registerTools(server);
registerResources(server);
registerResourceTemplates(server);

// Simple message handler for Cloudflare Workers
async function handleMcpMessage(message, _headers) {
  // Handle initialize
  if (message.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      result: {
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {
            listChanged: true,
          },
        },
        serverInfo: {
          name: 'helix-mcp-server',
          version: VERSION,
        },
      },
      id: message.id,
    };
  }

  // Handle tools/list
  if (message.method === 'tools/list') {
    // Define the tools manually since we can't access server.tools directly
    const tools = [
      {
        name: 'echo',
        description: 'Echo a message',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to echo',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'page-status',
        description: 'Get the status of a single page',
        inputSchema: {
          type: 'object',
          properties: {
            org: { type: 'string' },
            site: { type: 'string' },
            path: { type: 'string' },
            branch: { type: 'string', default: 'main' },
          },
          required: ['org', 'site', 'path'],
        },
      },
      {
        name: 'start-bulk-page-status',
        description: 'Start a bulk page status job',
        inputSchema: {
          type: 'object',
          properties: {
            org: { type: 'string' },
            site: { type: 'string' },
            branch: { type: 'string', default: 'main' },
            path: { type: 'string', default: '/' },
          },
          required: ['org', 'site'],
        },
      },
      {
        name: 'check-bulk-page-status',
        description: 'Check the status of a bulk page status job',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
          },
          required: ['jobId'],
        },
      },
      {
        name: 'audit-log',
        description: 'Get audit logs',
        inputSchema: {
          type: 'object',
          properties: {
            org: { type: 'string' },
            site: { type: 'string' },
            branch: { type: 'string', default: 'main' },
            from: { type: 'string' },
            to: { type: 'string' },
            since: { type: 'string' },
          },
          required: ['org', 'site'],
        },
      },
      {
        name: 'rum-data',
        description: 'Get RUM data',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            domainkey: { type: 'string' },
            startdate: { type: 'string' },
            enddate: { type: 'string' },
            aggregation: { type: 'string' },
          },
          required: ['url', 'domainkey', 'aggregation'],
        },
      },
    ];

    return {
      jsonrpc: '2.0',
      result: {
        tools,
      },
      id: message.id,
    };
  }

  // Handle tools/call
  if (message.method === 'tools/call') {
    const { name, arguments: args } = message.params;

    // Handle specific tools
    if (name === 'echo') {
      const { message: echoMessage } = args;
      return {
        jsonrpc: '2.0',
        result: {
          content: [
            {
              type: 'text',
              text: echoMessage,
            },
          ],
        },
        id: message.id,
      };
    }

    // For other tools, return a simple response
    return {
      jsonrpc: '2.0',
      result: {
        content: [
          {
            type: 'text',
            text: `Tool '${name}' called with arguments: ${JSON.stringify(args)}`,
          },
        ],
      },
      id: message.id,
    };
  }

  // Handle other methods
  return {
    jsonrpc: '2.0',
    error: {
      code: -32601,
      message: `Method '${message.method}' not found`,
    },
    id: message.id,
  };
}

// Export the fetch handler for Cloudflare Workers
export default {
  async fetch(request, _env, _ctx) {
    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
          },
        });
      }

      const url = new URL(request.url);

      // Handle server reset endpoint (for testing)
      if (request.method === 'POST' && url.pathname === '/reset') {
        return new Response(JSON.stringify({
          status: 'ok',
          message: 'Server state reset successfully',
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
          },
        });
      }

      // Handle MCP requests
      if (request.method === 'POST') {
        const body = await request.text();
        let message;
        try {
          message = JSON.parse(body);
        } catch {
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32700,
              message: 'Parse error',
            },
            id: null,
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
            },
          });
        }

        // Check for required headers
        const protocolVersion = request.headers.get('MCP-Protocol-Version') || request.headers.get('mcp-protocol-version');
        if (!protocolVersion) {
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'Missing MCP-Protocol-Version header',
            },
            id: null,
          }), {
            status: 406,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
            },
          });
        }

        // Process the message
        try {
          const response = await handleMcpMessage(message, Object.fromEntries(request.headers));

          return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
            },
          });
        } catch (error) {
          console.error('Error processing message:', error);
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: `Internal error: ${error.message}`,
            },
            id: message.id || null,
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
            },
          });
        }
      }

      // Handle GET requests (for SSE)
      if (request.method === 'GET') {
        return new Response('event: message\ndata: {"jsonrpc":"2.0","error":{"code":-32601,"message":"Method not found"},"id":null}\n\n', {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
          },
        });
      }

      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
        },
        id: null,
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
        },
      });

    } catch (error) {
      console.error('Error handling request:', error);
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
        },
        id: null,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },
};
