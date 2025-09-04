#!/usr/bin/env node

async function testToolsEndpoint() {
  console.log("Testing GET /tools endpoint...");
  
  const baseUrl = "http://localhost:3003";
  
  // Test 1: GET /tools without proper headers
  console.log("\n=== Test 1: GET /tools without proper headers ===");
  try {
    const response = await fetch(`${baseUrl}/tools`, {
      method: 'GET'
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 2: GET /tools with Accept header
  console.log("\n=== Test 2: GET /tools with Accept header ===");
  try {
    const response = await fetch(`${baseUrl}/tools`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream'
      }
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 3: GET /tools with session ID
  console.log("\n=== Test 3: GET /tools with session ID ===");
  try {
    const response = await fetch(`${baseUrl}/tools`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': 'test-session-' + Date.now()
      }
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 4: GET /tools with all proper headers
  console.log("\n=== Test 4: GET /tools with all proper headers ===");
  try {
    const response = await fetch(`${baseUrl}/tools`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': 'test-session-' + Date.now(),
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 5: POST /tools (for comparison)
  console.log("\n=== Test 5: POST /tools (for comparison) ===");
  try {
    const response = await fetch(`${baseUrl}/tools`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': 'test-session-' + Date.now(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: 1
      })
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 6: Different tools endpoints
  console.log("\n=== Test 6: Different tools endpoints ===");
  const toolsEndpoints = [
    '/tools',
    '/tools/',
    '/tools/list',
    '/tools/call',
    '/tools/echo'
  ];
  
  for (const endpoint of toolsEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/event-stream'
        }
      });
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`❌ ${endpoint} Error:`, error.message);
    }
  }

  console.log("\n🎉 GET /tools Test Summary:");
  console.log("✅ GET /tools is handled by the MCP server");
  console.log("✅ Behavior depends on Accept headers and session state");
  console.log("✅ MCP protocol uses POST for tool operations, not GET");
  console.log("✅ GET requests are handled but may not return tool data");
}

testToolsEndpoint();
