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

  // API tokens (these would typically come from your MCP client configuration)
  const HELIX_ADMIN_API_TOKEN = process.env.HELIX_ADMIN_API_TOKEN || "your_helix_token_here";
  const RUM_DOMAIN_KEY = process.env.RUM_DOMAIN_KEY || "your_rum_domain_key_here";

  try {
    // Set the protocol version before connecting
    transport.setProtocolVersion("2025-06-18");
    
    // Connect to the server
    await client.connect(transport);
    console.log("Connected to Helix MCP Server via HTTP");

    // Example 1: Check page status with API token
    console.log("\n=== Example 1: Page Status ===");
    const pageStatusResult = await client.callTool("page-status", {
      org: "adobe",
      site: "blog",
      branch: "main", 
      path: "/",
      helixAdminApiToken: HELIX_ADMIN_API_TOKEN
    });
    console.log("Page status result:", pageStatusResult);

    // Example 2: Get RUM data with domain key
    console.log("\n=== Example 2: RUM Data ===");
    const rumDataResult = await client.callTool("rum-data", {
      url: "blog.adobe.com",
      domainkey: RUM_DOMAIN_KEY,
      aggregation: "pageviews",
      startdate: "2025-01-01",
      enddate: "2025-01-31"
    });
    console.log("RUM data result:", rumDataResult);

    // Example 3: Start bulk status job with API token
    console.log("\n=== Example 3: Bulk Status Job ===");
    const bulkJobResult = await client.callTool("start-bulk-page-status", {
      org: "adobe",
      site: "blog",
      branch: "main",
      path: "/",
      helixAdminApiToken: HELIX_ADMIN_API_TOKEN
    });
    console.log("Bulk job result:", bulkJobResult);

    // Example 4: Get audit logs with API token
    console.log("\n=== Example 4: Audit Logs ===");
    const auditLogResult = await client.callTool("audit-log", {
      org: "adobe",
      site: "blog", 
      branch: "main",
      since: "24h",
      helixAdminApiToken: HELIX_ADMIN_API_TOKEN
    });
    console.log("Audit log result:", auditLogResult);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

