# Helix MCP Server

[![CI](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml/badge.svg)](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml)

An MCP (Model Context Protocol) server that provides tools for interacting with the Helix and Document Authoring Admin API. This server allows you to interact with Helix and DA APIs through MCP tools.

## Features

### Tools

- **page-status** - Retrieves the status of a single page including when it was last published, previewed, and edited, along with who performed those actions.
- **start-bulk-status** - Initiates a bulk status check for multiple pages in a site, returning a job ID for tracking the asynchronous operation.
- **check-bulk-status** - Checks the status of a bulk page status job and retrieves results for all pages including their publishing and preview status.
- **audit-log** - Retrieves detailed audit logs from the AEM Edge Delivery Services repository showing user activities, system operations, and performance metrics.
- **rum-data** - Queries Core Web Vitals and engagement metrics for sites or pages using operational telemetry data with various aggregation types.
- **aem-docs-search** - Searches the AEM documentation at www.aem.live for specific topics, features, or guidance with optional category filtering.

### Prompts

## Development

### Linting

This project uses ESLint for code quality and consistency. The linting configuration is set up with modern JavaScript standards and best practices.

**Available scripts:**
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Automatically fix linting issues where possible

## Cursor AI setup

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=helix-mcp-server&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJodHRwczovL2dpdGh1Yi5jb20vY2xvdWRhZG9wdGlvbi9oZWxpeC1tY3AiXSwgImVudiI6IHsgIkRBX0FETUlOX0FQSV9UT0tFTiI6ICJ5b3VyX2FwaV90b2tlbl9oZXJlIiwgIkhFTElYX0FETUlOX0FQSV9UT0tFTiI6ICJ5b3VyX2FwaV90b2tlbl9oZXJlIiwgIlJVTV9ET01BSU5fS0VZIjogInlvdXJfcnVtX2RvbWFpbl9rZXkifX0=)

To use this MCP server with Cursor AI, go to `Cursor Settings`, `MCP` and a `New global MCP server`. Add this entry to your list of `mcpServers`:

```
"helix-mcp-server": {
 "command": "npx",
  "args": [
    "https://github.com/cloudadoption/helix-mcp"
  ],
  "env": {
    "DA_ADMIN_API_TOKEN": "your_api_token_here",
    "HELIX_ADMIN_API_TOKEN": "your_api_token_here",
    "RUM_DOMAIN_KEY": "your_rum_domain_key"
  }
}
```

## VS Code with GitHub Copilot setup

To use this MCP server with VS Code and GitHub Copilot:

1. **Install the MCP extension**: Install the "Model Context Protocol" extension from the VS Code marketplace.

2. **Configure MCP settings**: Open VS Code settings (Cmd/Ctrl + ,) and search for "mcp".

3. **Add the MCP server configuration**: Add the following to your VS Code settings.json:

```json
{
  "mcp.servers": {
    "helix-mcp-server": {
      "command": "npx",
      "args": [
        "https://github.com/cloudadoption/helix-mcp"
      ],
      "env": {
        "DA_ADMIN_API_TOKEN": "your_api_token_here",
        "HELIX_ADMIN_API_TOKEN": "your_api_token_here"
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
