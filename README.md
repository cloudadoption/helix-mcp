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
"mcp-da-live": {
  "command": "node",
  "args": [
    "<local_path_to_repo>/src/index.js"
  ],
  "env": {
    "DA_ADMIN_API_TOKEN": "your_api_token_here"
  }
}
```

In the chat, you can then ask things like: `Via the DA Admin, give me the list of resources in <your_org>/<your_repo>/<path>`,

## Available MCP Tools

### da_admin_list_sources

Lists sources and directories in a DA repository.

**Input Schema:**
```json
{
  "org": "string",    // The organization name
  "repo": "string",   // The repository name
  "path": "string"    // Path to list contents from
}
```

**Example Usage:**
```javascript
// List contents of root directory
const result = await mcp.callTool("da_admin_list_sources", {
  org: "myorg",
  repo: "myrepo",
  path: "/"
});

// List contents of specific directory
const result = await mcp.callTool("da_admin_list_sources", {
  org: "myorg",
  repo: "myrepo",
  path: "/content/docs"
});
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "[
        {
          "path": "/org/repo/file.html",
          "name": "file",
          "ext": "html",
          "lastModified": 1234567890
        },
        {
          "path": "/org/repo/directory",
          "name": "directory"
        }
      ]"
    }
  ]
}
```

## Development

The server is built using:
- Node.js
- MCP SDK (@modelcontextprotocol/sdk)
- TypeScript

### Project Structure

```
.
├── src/
│   ├── index.js          # Main server entry point
│   ├── operations/       # Tool implementations
│   │   └── list.js      # List sources implementation
│   └── common/          # Shared utilities
│       ├── constants.js # Common constants
│       ├── utils.js     # Utility functions
│       └── version.js   # Version information
├── package.json
└── README.md
```

### Running the Server

```bash
npm start
```

The server will start and listen for MCP tool requests.

## Error Handling

The server handles various error cases:
- Invalid input parameters
- Authentication failures
- Network errors
- Resource not found errors

Each error is properly formatted according to the MCP specification.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
