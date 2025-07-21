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
import * as source from './operations/source.js';
import { VERSION } from './common/global.js';

const server = new Server(
  {
    name: 'helix-mcp-server',
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
    instructions: `
      You are a helpful assistant that provides tools to perform tasks related to the https://da.live platform, leveraging the https://docs.da.live/ admin API.
      DA standads for Document Authoring. The internal project name was known as "Dark Alley".
      DA, DA Live, da.live and Dark Alley are all the same plaform.
      DA Live Admin API is the API used to manage the content on the DA Live platform.
      org is a organization name.
      repo is a repository name.
      path is a path to a file or folder in the content of the repository.
      Quite often, <org>/<repo>/<path> is used to refer to a specific file or folder in the content of the repository. <path> may contain multiple slashes.
      Using for example myorg/myrepo/myfolder/myfile.html refers to the myorg org, myrepo repo and file at /myfolder/myfile.html.
      Content can be access via: https://admin.da.live/source/<org>/<repo>/<path>.<extension>
      For example, https://admin.da.live/source/myorg/myrepo/myfolder/myfile.html is the URL to access the myfile.html file in the myfolder folder in the myrepo repo in the myorg org.
    `,
  }
);

const tools = [
  ...list.tools,
  ...source.tools,
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.schema),
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    const tool = tools.find((t) => t.name === request.params.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    const args = tool.schema.parse(request.params.arguments);
    const result = await tool.handler(args);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
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
  console.error("Helix MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});