# Remote Helix MCP Server

[![CI](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml/badge.svg)](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml)

An MCP (Model Context Protocol) server that provides tools for interacting with the Helix and Document Authoring Admin API. This server allows you to interact with Helix and DA APIs through MCP tools.

## Features

- **HTTP Transport**: Full HTTP API support with streaming capabilities
- **Cloudflare Workers Deployment**: Deployable to Cloudflare Workers for serverless operation
- **Client-Side Configuration**: API tokens and keys are passed by the MCP client
- **Full MCP Protocol Support**: Implements the complete MCP specification

## Available Tools

### ✅ Fully Functional Tools

- **`echo`**: Simple echo tool for testing
- **`page-status`**: Get detailed status of a single page (published, previewed, edited timestamps and URLs)
- **`start-bulk-page-status`**: Start asynchronous bulk page status analysis jobs for entire sites
- **`check-bulk-page-status`**: Check bulk page status job results with detailed page analysis
- **`audit-log`**: Retrieve comprehensive audit logs with time filtering (from, to, since parameters)
- **`aem-docs-search`**: Search official AEM documentation at www.aem.live with ranking and content retrieval

- **`block-list`**: Get list of available AEM blocks from the official Block Collection
- **`block-details`**: Get detailed information (JS, CSS, HTML) for specific AEM blocks from the Block Collection

### 🚧 Limited Implementation Tools

- **`rum-data`**: Get Core Web Vitals and engagement metrics 
  - *Note: Returns structured response but full RUM bundle processing requires porting @adobe/rum-distiller to Workers environment*

### 🔧 Recent Enhancements

**December 2024**: The Cloudflare Workers version has been **completely rewritten** from stub implementations to fully functional tools:
- **Real API Integration**: All tools now make actual calls to Helix Admin APIs instead of returning placeholder responses
- **Block Collection Integration**: Block tools now use the official AEM Block Collection data and fetch real JS, CSS, and HTML code
- **Consistent Architecture**: Workers and local versions now share the same tool implementations for maintainability

## Cursor AI Setup

To use this MCP server with Cursor AI, go to `Cursor Settings`, `MCP` and add a new server with the following configuration:

```json
{
  "mcp.servers": {
    "helix-mcp-server": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://helix-mcp-server.aem-poc-lab.workers.dev/sse"
      ],
      "env": {
        "DA_ADMIN_API_TOKEN": "your_api_token_here",
        "HELIX_ADMIN_API_TOKEN": "your_api_token_here",
        "RUM_DOMAIN_KEY": "your_rum_domain_key"
      }
    }
  }
}
```

## VS Code with GitHub Copilot Setup

To use this MCP server with VS Code and GitHub Copilot:

1. **Install the MCP extension** for VS Code
2. **Add server configuration** to your VS Code settings:

```json
{
  "mcp.servers": {
    "helix-mcp-server": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://helix-mcp-server.aem-poc-lab.workers.dev/sse"
      ],
      "env": {
        "DA_ADMIN_API_TOKEN": "your_api_token_here",
        "HELIX_ADMIN_API_TOKEN": "your_api_token_here",
        "RUM_DOMAIN_KEY": "your_rum_domain_key"
      }
    }
  }
}
```

3. **Restart VS Code** after adding the configuration
4. **Verify installation** by opening the Command Palette (Cmd/Ctrl + Shift + P) and typing "MCP"

## Deployment

### Deploy to Cloudflare Workers

The server is configured to deploy to the **Adobe AEM POC** Cloudflare account:

```bash
# Deploy to staging environment
npm run deploy:staging
# Available at: https://helix-mcp-server.aem-poc-lab.workers.dev

# Deploy to production environment  
npm run deploy:production
# Available at: https://helix-mcp-server.aem-poc-lab.workers.dev

# Deploy to default environment
npm run deploy
# Available at: https://helix-mcp-server.aem-poc-lab.workers.dev
```
### Example Usage After Deployment

```bash
# Test production server
curl -X POST https://helix-mcp-server.aem-poc-lab.workers.dev \
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
```

## API Tokens

Replace the placeholder tokens with your actual API tokens:

- **DA_ADMIN_API_TOKEN**: Document Authoring Admin API token
- **HELIX_ADMIN_API_TOKEN**: Helix Admin API token  
- **RUM_DOMAIN_KEY**: RUM domain key for analytics

You can obtain the Helix admin token by following these instructions: [https://www.aem.live/docs/admin-apikeys](https://www.aem.live/docs/admin-apikeys) OR by logging into [admin.hlx.page/login](https://admin.hlx.page/login) and capturing the `auth_token` from the cookie.