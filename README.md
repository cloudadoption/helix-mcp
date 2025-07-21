# Helix MCP Server

An MCP (Model Context Protocol) server that provides tools for interacting with the Helix and Document Authoring Admin API. This server allows you to interact with Helix and DA APIs through MCP tools.

## Features


## Cursor AI setup

To use this MCP server with Cursor AI, go to `Cursor Settings`, `MCP` and a `New global MCP server`. Add this entry to your list of `mcpServers`:

```
"da-live-admin": {
 "command": "npx",
  "args": [
    "https://github.com/cloudadoption/helix-mcp"
  ],
  "env": {
    "DA_ADMIN_API_TOKEN": "your_api_token_here",
    "HELIX_ADMIN_API_TOKEN": "your_api_token_here"
  }
}
```


## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
