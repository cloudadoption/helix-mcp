import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from './server.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version',
};

function extractToken(request, env) {
  const authHeader = request.headers.get('Authorization');

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
    if (parts.length === 1) {
      return parts[0];
    }
  }

  return env.HELIX_ADMIN_API_TOKEN || null;
}

function handleHealthCheck(env) {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      service: 'helix-mcp',
      version: env.VERSION || '0.0.1',
      environment: env.ENVIRONMENT || 'development',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === '/' || url.pathname === '/health') {
      return handleHealthCheck(env);
    }

    const token = extractToken(request, env);
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing Helix Admin API token. Provide it in the Authorization header as: Bearer <token>' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      );
    }

    const server = createServer(token);

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);

    const mcpResponse = await transport.handleRequest(request);

    const headers = new Headers(mcpResponse.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      headers.set(key, value);
    }
    return new Response(mcpResponse.body, { status: mcpResponse.status, headers });
  },
};
