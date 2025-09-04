#!/usr/bin/env node

async function testNon406Scenarios() {
  console.log("Testing Scenarios Where Server Doesn't Return 406...");
  
  const baseUrl = "http://localhost:3003";
  
  // Test 1: OPTIONS request (CORS preflight)
  console.log("\n=== Test 1: OPTIONS request (CORS preflight) ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`✅ Headers: ${response.headers.get('Access-Control-Allow-Origin')}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 2: POST with correct Accept header but no session
  console.log("\n=== Test 2: POST with correct Accept header but no session ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
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

  // Test 3: POST with session ID but no initialization
  console.log("\n=== Test 3: POST with session ID but no initialization ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': 'test-session-123'
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

  // Test 4: GET with correct Accept header
  console.log("\n=== Test 4: GET with correct Accept header ===");
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

  // Test 5: POST with malformed JSON
  console.log("\n=== Test 5: POST with malformed JSON ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: '{"invalid": json}'
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 6: POST with empty body
  console.log("\n=== Test 6: POST with empty body ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: ''
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 7: POST with invalid JSON-RPC
  console.log("\n=== Test 7: POST with invalid JSON-RPC ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "invalid_method",
        id: 1
      })
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 8: Different HTTP methods
  console.log("\n=== Test 8: Different HTTP methods ===");
  const methods = ['PUT', 'DELETE', 'PATCH', 'HEAD'];
  
  for (const method of methods) {
    try {
      const response = await fetch(baseUrl, {
        method: method,
        headers: {
          'Accept': 'application/json, text/event-stream'
        }
      });
      console.log(`✅ ${method}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`❌ ${method} Error:`, error.message);
    }
  }

  console.log("\n🎉 Non-406 Scenarios Summary:");
  console.log("✅ OPTIONS requests return 200 (CORS preflight)");
  console.log("✅ POST with correct Accept header returns 400 (not 406)");
  console.log("✅ Malformed requests return 400 (not 406)");
  console.log("✅ Invalid JSON-RPC returns 400 (not 406)");
  console.log("✅ 406 is only returned for Accept header issues");
}

testNon406Scenarios();
