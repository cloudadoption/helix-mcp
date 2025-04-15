#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import * as list from './operations/list.js';
import { VERSION } from './common/global.js';

const server = new Server(
  {
    name: 'da-admin-mcp-server',
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("ListToolsRequestSchema", list.ListSourcesSchema);
  return {
    tools: [
      {
        name: "da_admin_list_sources",
        description: "Returns a list of sources from an organization",
        inputSchema: zodToJsonSchema(list.ListSourcesSchema),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error("CallToolRequestSchema", request);
  try {
    if (!process.env.DA_ADMIN_API_TOKEN) {
      throw new Error("DA_ADMIN_API_TOKEN is not set");
    }

    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "da_admin_list_sources": {
        console.error("da_admin_list_sources", request.params.arguments);
        const args = list.ListSourcesSchema.parse(request.params.arguments);
        const result = await list.listSources(
          args.org,
          args.repo,
          args.path
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DA Admin MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});