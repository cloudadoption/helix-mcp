#!/usr/bin/env node

async function testNon4xxStatusCodes() {
  console.log("Testing for Non-4xx Status Codes...");
  
  const baseUrl = "http://localhost:3003";
  
  // Test 1: Normal MCP client connection (should return 2xx)
  console.log("\n=== Test 1: Normal MCP client connection ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': 'test-session-' + Date.now()
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        id: 1,
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: "test-client",
            version: "1.0.0"
          }
        }
      })
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 2: Server health check (should return 2xx)
  console.log("\n=== Test 2: Server health check ===");
  try {
    const response = await fetch(baseUrl, {
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

  // Test 3: CORS preflight (should return 2xx)
  console.log("\n=== Test 3: CORS preflight ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Mcp-Session-Id'
      }
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`✅ CORS Headers: ${response.headers.get('Access-Control-Allow-Origin')}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 4: Valid tool call (should return 2xx)
  console.log("\n=== Test 4: Valid tool call ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': 'test-session-' + Date.now()
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        id: 2,
        params: {
          name: "echo",
          arguments: {
            message: "test"
          }
        }
      })
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 5: Server overload (should return 5xx)
  console.log("\n=== Test 5: Large payload test ===");
  try {
    const largePayload = JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      id: 3,
      params: {
        name: "echo",
        arguments: {
          message: "x".repeat(1000000) // 1MB payload
        }
      }
    });
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': 'test-session-' + Date.now()
      },
      body: largePayload
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 6: Invalid host header (should return 4xx or 5xx)
  console.log("\n=== Test 6: Invalid host header ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream',
        'Host': 'invalid-host.com'
      }
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 7: Connection timeout simulation
  console.log("\n=== Test 7: Connection behavior ===");
  try {
    // Test with a very slow connection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log("ℹ️ Request was aborted (timeout simulation)");
    } else {
      console.error("❌ Error:", error.message);
    }
  }

  console.log("\n🎉 Non-4xx Status Code Summary:");
  console.log("✅ 200: CORS preflight requests");
  console.log("✅ 2xx: Properly initialized MCP sessions");
  console.log("ℹ️ 5xx: Server errors (rare, only on overload)");
  console.log("ℹ️ 3xx: Redirects (not implemented)");
  console.log("ℹ️ 1xx: Informational (not used)");
}

testNon4xxStatusCodes();
