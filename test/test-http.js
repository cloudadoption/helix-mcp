#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function testHttpTransport() {
  console.log("Testing HTTP transport for Helix MCP Server...");
  
  // Reset server state first
  try {
    const resetResponse = await fetch("http://localhost:3003/reset", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("✅ Server state reset successfully");
  } catch (error) {
    console.log("ℹ️ Reset endpoint not available, continuing with test");
  }
  
  const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3003")
  );

  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  });

  try {
    // Set the protocol version before connecting
    transport.setProtocolVersion("2025-06-18");
    
    await client.connect(transport);
    console.log("✅ Successfully connected to MCP server via HTTP");

    // Test listing tools
    const tools = await client.listTools();
    console.log(`✅ Found ${tools.tools.length} tools:`, tools.tools.map(t => t.name));

    console.log("🎉 HTTP transport test completed successfully!");
    console.log("✅ Streamable HTTP transport is working correctly!");

  } catch (error) {
    console.error("❌ HTTP transport test failed:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testHttpTransport();
