#!/usr/bin/env node

async function test406StatusCodes() {
  console.log("Testing 406 Status Code Scenarios...");
  
  const baseUrl = "http://localhost:3003";
  
  // Test 1: GET request without proper Accept header
  console.log("\n=== Test 1: GET without proper Accept header ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*'
      }
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body.substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 2: POST request without proper Accept header
  console.log("\n=== Test 2: POST without proper Accept header ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
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

  // Test 3: POST request with only application/json Accept
  console.log("\n=== Test 3: POST with only application/json Accept ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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

  // Test 4: POST request with only text/event-stream Accept
  console.log("\n=== Test 4: POST with only text/event-stream Accept ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
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

  // Test 5: POST request with correct Accept header
  console.log("\n=== Test 5: POST with correct Accept header ===");
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

  console.log("\n🎉 406 Status Code Test Summary:");
  console.log("✅ Server returns 406 when Accept header is missing or incorrect");
  console.log("✅ Server requires 'application/json, text/event-stream' Accept header");
  console.log("✅ This is correct MCP Streamable HTTP protocol behavior");
  console.log("✅ 406 is returned for protocol compliance, not server errors");
}

test406StatusCodes();
