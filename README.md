# Helix MCP Server

An MCP (Model Context Protocol) server that provides tools for interacting with the Helix and Document Authoring Admin API. This server allows you to interact with Helix and DA APIs through MCP tools.

## Features


## Cursor AI setup

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=helix-mcp-server&config=JTdCJTIyY29tbWFuZCUyMiUzQSUyMm5weCUyMGh0dHBzJTNBJTJGJTJGZ2l0aHViLmNvbSUyRmNsb3VkYWRvcHRpb24lMkZoZWxpeC1tY3AlMjIlMkMlMjJlbnYlMjIlM0ElN0IlMjJEQV9BRE1JTl9BUElfVE9LRU4lMjIlM0ElMjJ5b3VyX2FwaV90b2tlbl9oZXJlJTIyJTJDJTIySEVMSVhfQURNSU5fQVBJX1RPS0VOJTIyJTNBJTIyeW91cl9hcGlfdG9rZW5faGVyZSUyMiUyQyUyMlJVTV9ET01BSU5fS0VZJTIyJTNBJTIyeW91cl9ydW1fZG9tYWluX2tleSUyMiU3RCU3RA%3D%3D)

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
