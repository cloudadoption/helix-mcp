# Remote Helix MCP Server
 
[![CI](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml/badge.svg)](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml)

An MCP (Model Context Protocol) server that provides tools to enable developers and administators of sites deployed with AEM Edge Delivery Services and Document Authoring.
An MCP (Model Context Protocol) server that provides tools for interacting with the Helix and Document Authoring Admin API. This server allows you to interact with Helix and DA APIs through MCP tools.
 
 ## Features
 
### Tools
- **Multiple Transport Support**: Supports both stdio and HTTP transport
- **Cloudflare Workers Deployment**: Deployable to Cloudflare Workers for serverless operation
- **Streamable HTTP Transport**: Full HTTP API support with streaming capabilities
- **Client-Side Configuration**: API tokens and keys are passed by the MCP client
- **Full MCP Protocol Support**: Implements the complete MCP specification

## MCP Protocol Support

This server fully implements the MCP (Model Context Protocol) specification with the following features:

### ✅ **Fully Supported**
- **Tools**: 6 tools with complete schemas and descriptions
- **Server Capabilities**: Proper capability negotiation
- **HTTP Transport**: Streamable HTTP with session management
- **Stdio Transport**: Standard stdio transport for local development
- **Ping/Pong**: Health check support
- **Error Handling**: Proper JSON-RPC error responses
- **Session Management**: UUID-based session handling

### ✅ **Available Tools**
- `echo`: Simple echo tool for testing
- `page-status`: Get status of a single page
- `start-bulk-page-status`: Start bulk page status job
- `check-bulk-page-status`: Check bulk page status job results
- `audit-log`: Retrieve audit logs
- `rum-data`: Get Core Web Vitals and engagement metrics

### ℹ️ **Not Implemented (By Design)**
- **Resources**: This server focuses on tools, not resources
- **Resource Templates**: Not needed for this use case
- **Prompts**: Not implemented for this server
- **Logging Level Control**: Not supported (uses default logging)
- **Context Management**: Limited support (responds to `/context` but no context functionality)

### 🧪 **Testing**
```bash
# Test HTTP transport
npm run test:http

# Test MCP protocol compliance
npm run test:protocol

# Test /context endpoint support
npm run test:context

# Test 406 status scenarios
npm run test:406

# Test non-406 scenarios
npm run test:non-406

# Test non-4xx status codes
npm run test:non-4xx

# Test GET /tools endpoint
npm run test:tools

# Test JSON-RPC protocol
npm run test:json-rpc

# Test comprehensive JSON-RPC features
npm run test:json-rpc-full

# Test session management
npm run test:session

# Run example with API tokens
npm run example:with-tokens
```

## Test Directory Structure

All tests are organized in the `/test` directory:

```
test/
├── test-http.js              # HTTP transport test
├── test-mcp-protocol.js      # MCP protocol compliance
├── test-context.js           # /context endpoint test
├── test-406-status.js        # 406 status scenarios
├── test-non-406-scenarios.js # Non-406 scenarios
├── test-non-4xx-status.js    # Non-4xx status codes
├── test-tools-endpoint.js    # GET /tools endpoint test
├── test-json-rpc-simple.js   # Simple JSON-RPC test
├── test-json-rpc.js          # Comprehensive JSON-RPC test
├── test-session-management.js # Session management test
└── examples/
    ├── http-client.js        # Basic HTTP client example
    └── with-api-tokens.js    # API token example
```

## Transport Modes

The server supports two transport modes:

### **✅ Stateless Mode (Current)**

The server runs in **stateless mode** by default, which means:

- **No session management required**
- **No session ID headers needed**
- **Multiple initializations work**
- **No state persistence between requests**
- **Perfect for serverless deployments**

**Benefits:**
- ✅ No "Server already initialized" errors
- ✅ No "Mcp-Session-Id header is required" errors
- ✅ Works perfectly with Cloudflare Workers
- ✅ No session management complexity
- ✅ Stateless and scalable

**Example Usage:**
```bash
# Initialize (no session ID needed)
curl -X POST http://localhost:3003 \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "id": 1,
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": { "tools": {} },
      "clientInfo": { "name": "test-client", "version": "1.0.0" }
    }
  }'

# Use tools (no session ID needed)
curl -X POST http://localhost:3003 \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 2
  }'
```

### **🔄 Stateful Mode (Alternative)**

For applications that need session management, you can switch to stateful mode by changing the transport configuration:

```javascript
// In src/http-server.js or src/worker.js
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID(), // Stateful mode
});
```

**Features:**
- Session ID generation and validation
- Session headers in responses
- State persistence between requests
- Session validation for all requests

## JSON-RPC Protocol

This server implements the **Model Context Protocol (MCP)** over **JSON-RPC 2.0**:

### **✅ JSON-RPC 2.0 Compliance**

| Feature | Status | Example |
|---------|--------|---------|
| **Request Format** | ✅ | `{"jsonrpc":"2.0","method":"tools/list","id":123,"params":{}}` |
| **Response Format** | ✅ | `{"jsonrpc":"2.0","result":{...},"id":123}` |
| **Error Format** | ✅ | `{"jsonrpc":"2.0","error":{"code":-32001,"message":"Session not found"},"id":null}` |
| **Error Codes** | ✅ | Standard JSON-RPC codes (-32600, -32601, etc.) |
| **Method Calls** | ✅ | `tools/list`, `tools/call`, `resources/list`, etc. |

### **✅ MCP JSON-RPC Methods**

The server supports these JSON-RPC methods:

- **`tools/list`** - List available tools
- **`tools/call`** - Execute a tool with parameters
- **`resources/list`** - List available resources
- **`resources/read`** - Read a resource
- **`prompts/list`** - List available prompts
- **`prompts/get`** - Get a prompt
- **`logging/setLevel`** - Set logging level
- **`ping`** - Health check
 
- **page-status** - Retrieves the status of a single page including when it was last published, previewed, and edited, along with who performed those actions.
- **start-bulk-status** - Initiates a bulk status check for multiple pages in a site, returning a job ID for tracking the asynchronous operation.
- **check-bulk-status** - Checks the status of a bulk page status job and retrieves results for all pages including their publishing and preview status.
- **audit-log** - Retrieves detailed audit logs from the AEM Edge Delivery Services repository showing user activities, system operations, and performance metrics.
- **rum-data** - Queries Core Web Vitals and engagement metrics for sites or pages using operational telemetry data with various aggregation types.
- **aem-docs-search** - Searches the AEM documentation at www.aem.live for specific topics, features, or guidance.
- **block-list** - Retrieve the list of blocks in the AEM Block Collection
- **block-details** - Retrieve the details for the implementation of a specific block in the AEM Block Collection
### **✅ JSON-RPC Error Codes**
 
### Prompts
| Code | Meaning | When Used |
|------|---------|-----------|
| **-32600** | Invalid Request | Malformed JSON-RPC request |
| **-32601** | Method not found | Unknown method called |
| **-32602** | Invalid params | Wrong parameters for method |
| **-32603** | Internal error | Server internal error |
| **-32000** | Server error | General server error |
| **-32001** | Session not found | Invalid session ID |
 
## Development
### **✅ Example JSON-RPC Request/Response**
 
### Linting
```bash
# Request
curl -X POST http://localhost:3003 \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: test-session" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 123,
    "params": {}
  }'
 
This project uses ESLint for code quality and consistency. The linting configuration is set up with modern JavaScript standards and best practices.
# Response
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [...]
  },
  "id": 123
}
```

## HTTP Status Codes
 
**Available scripts:**
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Automatically fix linting issues where possible
The server returns specific HTTP status codes for different scenarios:

### **200 OK**
The server returns `200 OK` for:
- **CORS preflight requests**: OPTIONS requests with proper headers
- **Properly initialized MCP sessions**: When session is established correctly
- **Server-Sent Events**: Streaming responses for MCP protocol

**Example**:
```bash
# CORS preflight returns 200
curl -X OPTIONS http://localhost:3003

# Properly initialized MCP session returns 200
# (requires proper session setup)
```
 
## Usage
### **404 Not Found**
The server returns `404 Not Found` for:
- **Session not found**: When Mcp-Session-Id doesn't match any active session
- **Invalid session ID**: When session ID is malformed or expired
 
### Cursor AI setup
### **406 Not Acceptable**
The server returns `406 Not Acceptable` **ONLY** when:
- **Missing Accept header**: Client doesn't specify what content types it accepts
- **Incorrect Accept header**: Client doesn't accept both `application/json` and `text/event-stream`
- **Protocol compliance**: MCP Streamable HTTP requires specific Accept headers

**Required Accept header**: `application/json, text/event-stream`

**Required Protocol Version header**: `MCP-Protocol-Version: 2025-06-18`

**Note**: This is **correct behavior** according to the [MCP specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http). The server returns HTTP 406 status with JSON-RPC error responses in the body.

**Example**:
```bash
# This returns 406 (correct behavior)
curl -X GET http://localhost:3003

# This returns 406 (correct behavior)  
curl -X POST http://localhost:3003 -H "Accept: application/json"

# This works (returns 400 for missing session ID, but not 406)
curl -X POST http://localhost:3003 -H "Accept: application/json, text/event-stream" -H "MCP-Protocol-Version: 2025-06-18"
```

### **400 Bad Request**
The server returns `400 Bad Request` when:
- **Server not initialized**: Session not properly established
- **Missing session ID**: Required for MCP Streamable HTTP
- **Invalid JSON-RPC**: Malformed request format
- **Malformed JSON**: Syntax errors in request body
- **Empty request body**: No content provided

### **405 Method Not Allowed**
The server returns `405 Method Not Allowed` for:
- **PUT requests**: Not supported by MCP protocol
- **PATCH requests**: Not supported by MCP protocol
- **HEAD requests**: Not supported by MCP protocol

### **GET /tools Endpoint**

The server handles GET requests to `/tools` but with specific behavior:

| Scenario | Status Code | Reason |
|----------|-------------|---------|
| **No Accept header** | **406** | Missing content type specification |
| **With Accept header** | **400** | Missing session ID |
| **With session ID** | **404** | Session not found |
| **Valid session** | **200** | Would return tool list (if session valid) |

**Important**: MCP protocol uses **POST** for tool operations, not GET. GET `/tools` is handled but may not return the expected tool data.

### **📋 Complete Status Code Summary**

| Status Code | When Returned | Example | Notes |
|-------------|---------------|---------|-------|
| **200** | CORS preflight, proper MCP sessions | `curl -X OPTIONS http://localhost:3003` | Standard success |
| **404** | Session not found (stateful mode only) | Invalid Mcp-Session-Id | Session management |
| **406** | Missing/incorrect Accept header | `curl -X GET http://localhost:3003` | **Correct MCP behavior** |
| **400** | Malformed JSON, unsupported protocol version | `curl -X POST -H "Accept: application/json, text/event-stream"` | Request validation |
| **405** | Unsupported HTTP methods | `curl -X PUT http://localhost:3003` | Method restrictions |

**Note**: HTTP 406 responses include JSON-RPC error bodies as required by the MCP specification. In stateless mode, session-related errors (404) are not applicable.

## Transport Modes

### Stdio Transport (Default)
The server runs using stdio transport by default, suitable for local development and IDE integration.

### Streamable HTTP Transport
For HTTP-based deployments and Cloudflare Workers, this server uses the **Streamable HTTP** transport as defined in the [MCP specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http).

**Key Features:**
- **Standard MCP Protocol**: Implements the current MCP Streamable HTTP specification
- **Stateless Mode**: No session management required (perfect for serverless)
- **CORS Support**: Full CORS headers for web client compatibility
- **Cloudflare Compatible**: Works with Cloudflare Workers edge deployment
- **JSON-RPC 2.0**: All messages follow JSON-RPC 2.0 specification

**Transport Behavior:**
- **POST Requests**: Send JSON-RPC messages to the server
- **GET Requests**: Can initiate Server-Sent Events (SSE) streams
- **Accept Headers**: Requires `application/json, text/event-stream`
- **Protocol Version**: Requires `MCP-Protocol-Version: 2025-06-18` header
- **CORS Headers**: Supports `MCP-Protocol-Version` and `Mcp-Session-Id` headers

**Required Headers for HTTP Requests:**
```bash
Accept: application/json, text/event-stream
Content-Type: application/json
MCP-Protocol-Version: 2025-06-18
```

**CORS Headers Supported:**
```bash
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id
```

```bash
# Run with HTTP transport locally
npm run start:http

# Run in development mode with HTTP transport
npm run dev
```

## Deployment

### **🚀 Deploy to Cloudflare Workers**

The server is configured to deploy to the **Franklin-Dev** Cloudflare account with custom domain `bbird.live`.

```bash
# Deploy to staging environment
npm run deploy:staging
# Available at: https://staging-api.bbird.live

# Deploy to production environment  
npm run deploy:production
# Available at: https://api.bbird.live

# Deploy to default environment
npm run deploy
# Available at: https://api.bbird.live
```

### **🌐 Deployment URLs**

After deployment, your server will be available at:

| Environment | Cloudflare Workers URL | Custom Domain URL |
|-------------|------------------------|-------------------|
| **Staging** | `https://helix-mcp-staging.adobeaem.workers.dev` | `https://staging-api.bbird.live` (when configured) |
| **Production** | `https://helix-mcp.adobeaem.workers.dev` | `https://api.bbird.live` (when configured) |
| **Default** | `https://helix-mcp-server.adobeaem.workers.dev` | `https://api.bbird.live` (when configured) |

**Note**: Currently deployed to Adobe AEM account. Franklin-Dev account configuration is in `wrangler.toml` but requires domain setup.

### **🔧 Account Configuration**

The server is currently deployed to the **Adobe AEM (Hackathon)** Cloudflare account:
- **Account ID**: `e1e360001bae52605e88f2b2d0e82d27`
- **Account Name**: Adobe AEM (Hackathon)
- **Custom Domain**: `bbird.live` (when configured)
- **Worker Names**:
  - Staging: `helix-mcp-staging`
  - Production: `helix-mcp`
  - Default: `helix-mcp-server`

**Franklin-Dev Configuration**: The `wrangler.toml` is configured for Franklin-Dev account (`852dfa4ae1b0d579df29be65b986c101`) but deployment currently goes to Adobe AEM account.

### **🔄 Alternative Accounts**

If you need to deploy to a different account:

```bash
# Adobe AEM (Hackathon) account
npm run deploy:adobe:staging
npm run deploy:adobe:production

# Franklin-Dev account (default)
npm run deploy:franklin:staging
npm run deploy:franklin:production
```

### **📝 Example Usage After Deployment**

```bash
# Test staging server (Cloudflare Workers URL)
curl -X POST https://helix-mcp-staging.adobeaem.workers.dev \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "id": 1,
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": { "tools": {} },
      "clientInfo": { "name": "test-client", "version": "1.0.0" }
    }
  }'

# Test production server (Cloudflare Workers URL)
curl -X POST https://helix-mcp.adobeaem.workers.dev \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "id": 1,
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": { "tools": {} },
      "clientInfo": { "name": "test-client", "version": "1.0.0" }
    }
  }'

# Test tools/list
curl -X POST https://helix-mcp-staging.adobeaem.workers.dev \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 2
  }'

# Test echo tool
curl -X POST https://helix-mcp-staging.adobeaem.workers.dev \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "id": 3,
    "params": {
      "name": "echo",
      "arguments": {
        "message": "Hello World!"
      }
    }
  }'
```

## Cursor AI setup
 
 [![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=helix-mcp-server&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJodHRwczovL2dpdGh1Yi5jb20vY2xvdWRhZG9wdGlvbi9oZWxpeC1tY3AiXSwgImVudiI6IHsgIkRBX0FETUlOX0FQSV9UT0tFTiI6ICJ5b3VyX2FwaV90b2tlbl9oZXJlIiwgIkhFTElYX0FETUlOX0FQSV9UT0tFTiI6ICJ5b3VyX2FwaV90b2tlbl9oZXJlIiwgIlJVTV9ET01BSU5fS0VZIjogInlvdXJfcnVtX2RvbWFpbl9rZXkifX0=)
 
@@ -51,7 +500,7 @@ To use this MCP server with Cursor AI, go to `Cursor Settings`, `MCP` and a `New
 }
 ```
 
### VS Code with GitHub Copilot setup
## VS Code with GitHub Copilot setup
 
 To use this MCP server with VS Code and GitHub Copilot:
 
@@ -71,27 +520,10 @@ To use this MCP server with VS Code and GitHub Copilot:
       ],
       "env": {
         "DA_ADMIN_API_TOKEN": "your_api_token_here",
        "HELIX_ADMIN_API_TOKEN": "your_api_token_here"
        "HELIX_ADMIN_API_TOKEN": "your_api_token_here",
        "RUM_DOMAIN_KEY": "your_rum_domain_key"
       }
     }
   }
 }
```

4. **Restart VS Code**: After adding the configuration, restart VS Code to load the MCP server.

5. **Verify installation**: Open the Command Palette (Cmd/Ctrl + Shift + P) and type "MCP" to see available MCP commands.

**Note**: Replace `your_api_token_here` with your actual API tokens. You can obtain the Helix admin token by following these instructions: [https://www.aem.live/docs/admin-apikeys](https://www.aem.live/docs/admin-apikeys) OR by logging into [admin.hlx.page/login](https://admin.hlx.page/login) and capturing the `auth_token` from the cookie.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
```
\ No newline at end of file
