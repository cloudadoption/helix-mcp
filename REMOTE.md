# Remote Helix MCP Server

[![CI](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml/badge.svg)](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml)

An MCP (Model Context Protocol) server that provides tools for interacting with the Helix and Document Authoring Admin API. This server allows you to interact with Helix and DA APIs through MCP tools.

## Features

- **HTTP Transport**: Full HTTP API support with streaming capabilities
- **Cloudflare Workers Deployment**: Deployable to Cloudflare Workers for serverless operation
- **Client-Side Configuration**: API tokens and keys are passed by the MCP client
- **Full MCP Protocol Support**: Implements the complete MCP specification

## Available Tools

- `echo`: Simple echo tool for testing
- `page-status`: Get status of a single page
- `start-bulk-page-status`: Start bulk page status job
- `check-bulk-page-status`: Check bulk page status job results
- `audit-log`: Retrieve audit logs
- `rum-data`: Get Core Web Vitals and engagement metrics
- `aem-docs-search`: Search AEM documentation

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

The server is configured to deploy to the **Adobe AEM (Hackathon)** Cloudflare account:

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