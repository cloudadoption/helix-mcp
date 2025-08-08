#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function main() {
  // Create HTTP transport client
  const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3003") // Change this to your Cloudflare Workers URL when deployed
  );

  // Create MCP client
  const client = new Client({
    name: "helix-mcp-client",
    version: "1.0.0",
  });

  try {
    // Set the protocol version before connecting
    transport.setProtocolVersion("2025-06-18");
    
    // Connect to the server
    await client.connect(transport);
    console.log("Connected to Helix MCP Server via HTTP");

    // List available tools
    const tools = await client.listTools();
    console.log("Available tools:", tools.tools.map(tool => tool.name));

    // List available resources
    const resources = await client.listResources();
    console.log("Available resources:", resources.resources.map(resource => resource.uri));

    // Example: Call the echo tool
    const echoResult = await client.callTool("echo", {
      message: "Hello from HTTP client!"
    });
    console.log("Echo result:", echoResult);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
