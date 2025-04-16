# DA Admin MCP Server

An MCP (Model Context Protocol) server that provides tools for interacting with the Document Authoring Admin API. This server allows you to manage content, versions, and configurations in DA repositories through MCP tools.

## Features

- List sources and directories in DA repositories
- Manage source content (get, create, delete)
- Handle content versioning
- Copy and move content between locations
- Manage configurations

## Cursor AI setup

To use this MCP server with Cursor AI, go to `Cursor Settings`, `MCP` and a `New global MCP server`. Add this entry to your list of `mcpServers`:

```
"da-live": {
 "command": "npx",
  "args": [
    "https://github.com/kptdobe/da.live-mcp"
  ],
  "env": {
    "DA_ADMIN_API_TOKEN": "your_api_token_here"
  }
}
```

In the chat, you can then ask things like: `Via the DA Admin, give me the list of resources in <your_org>/<your_repo>/<path>`.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
