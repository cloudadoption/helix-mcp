// Cloudflare Workers implementation - standalone without MCP SDK dependencies

const VERSION = '0.0.1';

// Worker-compatible utility functions
async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }
  return response.text();
}

function workerFormatHelixAdminURL(api, org, repo, branch, path, ext) {
  const HELIX_ADMIN_API_URL = 'https://admin.hlx.page';
  return `${HELIX_ADMIN_API_URL}/${api}/${org}/${repo}/${branch}/${path.startsWith('/') ? path.slice(1) : path}${ext ? `.${ext}` : ''}`;
}

async function workerHelixAdminRequest(url, options = {}, apiToken = null, env = {}) {
  const VERSION = '0.0.1';
  const USER_AGENT = `modelcontextprotocol/servers/helix/v${VERSION} Cloudflare-Workers`;

  const headers = {
    'User-Agent': USER_AGENT,
    ...options.headers,
  };

  const token = apiToken || env.HELIX_ADMIN_API_TOKEN;
  if (token) {
    headers['X-Auth-Token'] = token;
  }

  const init = {
    method: options.method || 'GET',
    headers,
    body: options.body || undefined,
  };

  const response = await fetch(url, init);
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const xError = response.headers.get('x-error');
    throw new Error(`Admin API error: ${response.status} - ${xError}. ${responseBody}`);
  }

  return responseBody;
}

function workerWrapToolJSONResult(result) {
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

// Helper functions for bulk status processing
function pad(number) {
  return number.toString().padStart(2, '0');
}

function toUTCDate(d) {
  const date = new Date(d);
  const dd = pad(date.getUTCDate());
  const mm = pad(date.getUTCMonth() + 1);
  const yyyy = date.getUTCFullYear();
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  return `${mm}/${dd}/${yyyy} ${hours}:${minutes}`;
}

function buildSequenceStatus(edit, preview, publish) {
  const date = (d) => !Number.isNaN(d.getTime());
  const editDate = new Date(edit);
  const previewDate = new Date(preview);
  const publishDate = new Date(publish);
  const inSequence = (editDate <= previewDate && previewDate <= publishDate);

  let status;
  if (!date(editDate)) {
    status = 'No source';
  } else if (date(editDate) && !date(previewDate) && !date(publishDate)) {
    status = 'Not previewed';
  } else if (
    date(editDate)
    && date(previewDate)
    && !date(publishDate)
    && editDate <= previewDate
  ) {
    status = 'Not published';
  } else {
    status = inSequence ? 'Current' : 'Pending changes';
  }

  return status;
}

function processPageStatusData(data, preview, live) {
  const resources = data.resources.map((resource) => {
    const {
      path,
      sourceLastModified,
      previewLastModified,
      publishLastModified,
      publishConfigRedirectLocation,
      previewConfigRedirectLocation,
    } = resource;
    const ignore = ['/helix-env.json', '/sitemap.json'];
    if (path && !ignore.includes(path)) {
      const status = buildSequenceStatus(
        sourceLastModified,
        previewLastModified,
        publishLastModified,
      );

      return {
        path,
        isRedirect: !!(publishConfigRedirectLocation || previewConfigRedirectLocation),
        status,
        sourceLastModified: sourceLastModified ? toUTCDate(sourceLastModified) : 'n/a',
        previewLastModified: previewLastModified ? toUTCDate(previewLastModified) : 'n/a',
        previewLink: previewLastModified && preview ? `https://${preview}${path}` : 'n/a',
        publishLastModified: publishLastModified ? toUTCDate(publishLastModified) : 'n/a',
        publishLink: publishLastModified && live ? `https://${live}${path}` : 'n/a',
      };
    }
    return null;
  }).filter((resource) => resource !== null);

  return {
    ...data,
    resources,
  };
}

// Helper functions for AEM docs search
function findResults(query, indexDocs) {
  const filterOut = ['and', 'but', 'can', 'eds', 'for', 'how', 'the', 'use', 'what', 'aem'];
  const terms = query.toLowerCase().split(' ').map((e) => e.trim()).filter((e) => e.length > 2 && !filterOut.includes(e));
  if (!terms.length) return { terms, match: [] };

  const perfectMatches = new Set();
  const strongMatches = new Set();
  const fallbackMatches = new Set();

  indexDocs.forEach((doc) => {
    if (terms.every((term) => doc.title.toLowerCase().includes(term))) {
      perfectMatches.add(doc);
    } else if (terms.some((term) => doc.title.toLowerCase().includes(term))) {
      strongMatches.add(doc);
    } else if (terms.some((term) => `${doc.title} ${doc.content}`.toLowerCase().includes(term))) {
      fallbackMatches.add(doc);
    }
  });

  const matches = [...perfectMatches, ...strongMatches, ...fallbackMatches];
  return { terms, match: matches };
}

async function indexDataToResult(match) {
  let markup;
  const fullUrl = `https://www.aem.live${match.path}`;
  try {
    const resp = await fetch(fullUrl);
    markup = await resp.text();
  } catch {
    // nothing
  }

  return {
    title: match.title,
    description: match.description,
    url: `https://www.aem.live${match.path}`,
    content: markup || match.content,
    lastModified: match.lastModified,
  };
}

// Simple message handler for Cloudflare Workers
async function handleMcpMessage(message, _headers, env = {}) {
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
            helixAdminApiToken: { type: 'string', description: 'Helix Admin API token (optional)' },
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
            helixAdminApiToken: { type: 'string', description: 'Helix Admin API token (optional)' },
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
            helixAdminApiToken: { type: 'string', description: 'Helix Admin API token (optional)' },
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
            since: { type: 'string', pattern: '^[0-9]+[hdm]$' },
            helixAdminApiToken: { type: 'string', description: 'Helix Admin API token (optional)' },
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
            aggregation: {
              type: 'string',
              enum: ['pageviews', 'visits', 'bounces', 'organic', 'earned', 'lcp', 'cls', 'inp', 'ttfb', 'engagement', 'errors'],
            },
          },
          required: ['url', 'domainkey', 'aggregation'],
        },
      },
      {
        name: 'aem-docs-search',
        description: 'Search AEM documentation',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            maxResults: { type: 'number', minimum: 1, maximum: 20, default: 10 },
          },
          required: ['query'],
        },
      },
      {
        name: 'block-list',
        description: 'Get a list of available blocks',
        inputSchema: {
          type: 'object',
          properties: {
            random_string: { type: 'string', description: 'Dummy parameter for no-parameter tools' },
          },
          required: ['random_string'],
        },
      },
      {
        name: 'block-details',
        description: 'Get details for a specific block',
        inputSchema: {
          type: 'object',
          properties: {
            blockName: { type: 'string' },
          },
          required: ['blockName'],
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

    try {
      // Handle echo tool
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

      // Handle page-status tool
      if (name === 'page-status') {
        const { org, site, branch = 'main', path, helixAdminApiToken } = args;
        const url = workerFormatHelixAdminURL('status', org, site, branch, path);
        const response = await workerHelixAdminRequest(url, {}, helixAdminApiToken, env);

        return {
          jsonrpc: '2.0',
          result: workerWrapToolJSONResult(response),
          id: message.id,
        };
      }

      // Handle audit-log tool
      if (name === 'audit-log') {
        const { org, site, branch = 'main', from, to, since, helixAdminApiToken } = args;
        const baseUrl = `${workerFormatHelixAdminURL('log', org, site, branch, '').replace(/\/$/, '')}`;

        const queryParams = new URLSearchParams();
        if (from) queryParams.append('from', from);
        if (to) queryParams.append('to', to);
        if (since) queryParams.append('since', since);

        const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;
        const response = await workerHelixAdminRequest(url, {}, helixAdminApiToken, env);

        return {
          jsonrpc: '2.0',
          result: workerWrapToolJSONResult(response),
          id: message.id,
        };
      }

      // Handle start-bulk-page-status tool
      if (name === 'start-bulk-page-status') {
        const { org, site, branch = 'main', path = '/', helixAdminApiToken } = args;
        const url = workerFormatHelixAdminURL('status', org, site, branch, '/*');

        // Validate and normalize path
        let normalizedPath = path || '/*';
        if (!normalizedPath.startsWith('/')) normalizedPath = `/${normalizedPath}`;
        if (!normalizedPath.endsWith('/*')) {
          if (normalizedPath.endsWith('/')) {
            normalizedPath += '*';
          } else {
            normalizedPath += '/*';
          }
        }

        const jobJson = await workerHelixAdminRequest(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paths: [normalizedPath],
            select: ['edit', 'preview', 'live'],
            forceAsync: true,
          }),
        }, helixAdminApiToken, env);

        if (!jobJson.job || jobJson.job.state !== 'created') {
          throw new Error('Failed to create bulk status job');
        }

        const jobId = jobJson.links.self.split('/job/').pop();

        return {
          jsonrpc: '2.0',
          result: workerWrapToolJSONResult({
            name: jobJson.job.name,
            state: jobJson.job.state,
            created: jobJson.job.createTime,
            jobId,
          }),
          id: message.id,
        };
      }

      // Handle check-bulk-page-status tool
      if (name === 'check-bulk-page-status') {
        const { jobId, helixAdminApiToken } = args;
        const HELIX_ADMIN_API_URL = 'https://admin.hlx.page';
        const url = `${HELIX_ADMIN_API_URL}/job/${jobId}/details`;

        const jobDetailsJson = await workerHelixAdminRequest(url, {
          method: 'GET',
        }, helixAdminApiToken, env);

        const state = jobDetailsJson.state;

        if (state !== 'completed' && state !== 'stopped') {
          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult({
              name: jobDetailsJson.name,
              state: jobDetailsJson.state,
              created: jobDetailsJson.createTime,
              startTime: jobDetailsJson.startTime,
              jobId,
            }),
            id: message.id,
          };
        }

        // Process completed job data
        const info = jobId.split('/');
        const org = info[0];
        const site = info[1];

        // Get hosts for preview/live links
        let live = null;
        let preview = null;
        try {
          const statusUrl = workerFormatHelixAdminURL('status', org, site, 'main', '');
          const statusJson = await workerHelixAdminRequest(statusUrl, {}, helixAdminApiToken, env);
          live = new URL(statusJson.live.url).host;
          preview = new URL(statusJson.preview.url).host;
        } catch {
          // Continue without hosts if unable to fetch
        }

        // Process page status data
        const processedData = processPageStatusData(jobDetailsJson.data, preview, live);

        return {
          jsonrpc: '2.0',
          result: workerWrapToolJSONResult({
            name: jobDetailsJson.name,
            state: jobDetailsJson.state,
            created: jobDetailsJson.createTime,
            startTime: jobDetailsJson.startTime,
            stopTime: jobDetailsJson.stopTime,
            jobId,
            data: processedData,
          }),
          id: message.id,
        };
      }

      // Handle aem-docs-search tool
      if (name === 'aem-docs-search') {
        const { query, maxResults = 10 } = args;

        try {
          const indexUrl = 'https://www.aem.live/docpages-index.json';
          const response = await fetch(indexUrl);
          const data = await response.json();

          const { terms, match } = findResults(query, data.data);
          const results = await Promise.all(match.slice(0, maxResults).map(indexDataToResult));

          const searchResults = {
            searchQuery: query,
            searchTerms: terms,
            totalCount: match.length,
            results,
          };

          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult(searchResults),
            id: message.id,
          };
        } catch (error) {
          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult({
              error: 'Failed to perform AEM documentation search',
              message: error.message,
              searchQuery: query,
            }),
            id: message.id,
          };
        }
      }

      // Handle rum-data tool (simplified version - full RUM distiller may not work in Workers)
      if (name === 'rum-data') {
        const { url, domainkey, startdate, enddate, aggregation } = args;

        // Remove protocol from URL
        const domain = url.replace(/^https?:\/\//, '');

        // Get default dates if not provided
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        const format = (d) => d.toISOString().split('T')[0];

        const startDateFinal = startdate?.trim() || format(oneWeekAgo);
        const endDateFinal = enddate?.trim() || format(now);

        try {
          // Simplified RUM data fetch - just return basic structure
          // Full RUM bundle processing would require porting @adobe/rum-distiller
          const result = {
            message: 'RUM data processing is not yet fully implemented in Cloudflare Workers version',
            url: domain,
            domainkey: domainkey ? '***' : 'not provided',
            dateRange: {
              start: startDateFinal,
              end: endDateFinal,
            },
            aggregation,
            note: 'This requires porting @adobe/rum-distiller package to work in Workers environment',
          };

          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult(result),
            id: message.id,
          };
        } catch (error) {
          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult({
              error: 'RUM data processing failed',
              message: error.message,
            }),
            id: message.id,
          };
        }
      }

      // Handle block-list tool
      if (name === 'block-list') {
        try {
          // This is a placeholder - the actual implementation would fetch from a block registry
          const blocks = [
            'header',
            'hero',
            'cards',
            'columns',
            'fragment',
            'accordion',
            'carousel',
            'tabs',
            'quote',
            'embed',
          ];

          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult({
              blocks: blocks.map(name => ({ name, description: `${name} block` })),
            }),
            id: message.id,
          };
        } catch (error) {
          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult({
              error: 'Failed to retrieve block list',
              message: error.message,
            }),
            id: message.id,
          };
        }
      }

      // Handle block-details tool
      if (name === 'block-details') {
        const { blockName } = args;

        try {
          // This is a placeholder - the actual implementation would fetch from a block registry
          const blockDetails = {
            name: blockName,
            description: `Details for ${blockName} block`,
            documentation: `https://www.aem.live/developer/block-collection/${blockName}`,
            code: `// ${blockName} block implementation would be here`,
            metadata: {
              category: 'content',
              status: 'active',
            },
            note: 'This is a placeholder implementation. Real block details would be fetched from the AEM block collection.',
          };

          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult(blockDetails),
            id: message.id,
          };
        } catch (error) {
          return {
            jsonrpc: '2.0',
            result: workerWrapToolJSONResult({
              error: 'Failed to retrieve block details',
              message: error.message,
              blockName,
            }),
            id: message.id,
          };
        }
      }

      // Unknown tool
      return {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Unknown tool: ${name}`,
        },
        id: message.id,
      };

    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Tool execution error: ${error.message}`,
        },
        id: message.id,
      };
    }
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
          const response = await handleMcpMessage(message, Object.fromEntries(request.headers), _env);

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
