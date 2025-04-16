#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';

import * as list from './operations/list.js';
import * as source from './operations/source.js';
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
  return {
    tools: [
      ...list.ListToolsDefinition,
      ...source.SourceToolsDefinition,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "da_admin_list_sources": {
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

      case "da_admin_get_source": {
        const args = source.GetSourceSchema.parse(request.params.arguments);
        const result = await source.getSource(
          args.org,
          args.repo,
          args.path,
          args.ext
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "da_admin_create_source": {
        const args = source.CreateSourceSchema.parse(request.params.arguments);
        const result = await source.createSource(
          args.org,
          args.repo,
          args.path,
          args.ext,
          args.content
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "da_admin_delete_source": {
        const args = source.DeleteSourceSchema.parse(request.params.arguments);
        const result = await source.deleteSource(
          args.org,
          args.repo,
          args.path,
          args.ext
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