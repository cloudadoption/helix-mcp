# Helix MCP Server

[![CI](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml/badge.svg)](https://github.com/cloudadoption/helix-mcp/actions/workflows/main.yml)

An MCP (Model Context Protocol) server that provides tools for interacting with the Helix and Document Authoring Admin API. This server allows you to interact with Helix and DA APIs through MCP tools.

## Features

## Development

### Linting

This project uses ESLint for code quality and consistency. The linting configuration is set up with modern JavaScript standards and best practices.

**Available scripts:**
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Automatically fix linting issues where possible
- `npm run pre-commit` - Run linting (useful for pre-commit hooks)

**Linting rules include:**
- 2-space indentation
- Single quotes for strings
- Semicolons required
- No trailing spaces
- Consistent comma usage
- Modern JavaScript practices (const over let, template literals, etc.)

### Continuous Integration

This project uses GitHub Actions for continuous integration:

- **Linting**: Runs on every PR and push to main
- **Auto-fix Check**: Ensures all auto-fixable issues are resolved
- **Build Verification**: Confirms the project can be built successfully

The CI workflow will:
1. Install dependencies
2. Run linting checks
3. Attempt to auto-fix issues
4. Fail if auto-fixable issues are found (ensuring code quality)

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
