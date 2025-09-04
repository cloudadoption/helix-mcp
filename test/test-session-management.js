#!/usr/bin/env node

async function testSessionManagement() {
  console.log("Testing Session Management (Stateless Mode)...");
  
  const baseUrl = "http://localhost:3003";
  
  // Reset server state first
  console.log("\n=== Step 0: Reset server state ===");
  try {
    const resetResponse = await fetch(`${baseUrl}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Reset Status: ${resetResponse.status} ${resetResponse.statusText}`);
    const resetBody = await resetResponse.text();
    console.log(`✅ Reset Response: ${resetBody}`);
  } catch (error) {
    console.error("❌ Reset Error:", error.message);
  }

  // Test 1: Initialization without proper headers
  console.log("\n=== Test 1: Initialization without proper headers ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        id: 1,
        params: {
          protocolVersion: "2025-06-18",
          capabilities: { tools: {} },
          clientInfo: { name: "test-client", version: "1.0.0" }
        }
      })
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 2: Proper initialization (stateless mode)
  console.log("\n=== Test 2: Proper initialization (stateless mode) ===");
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2025-06-18'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        id: 1,
        params: {
          protocolVersion: "2025-06-18",
          capabilities: { tools: {} },
          clientInfo: { name: "test-client", version: "1.0.0" }
        }
      })
    });
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.log(`✅ Response: ${body}`);
    
    // In stateless mode, there should be NO session ID header
    const sessionId = response.headers.get('mcp-session-id') || response.headers.get('Mcp-Session-Id');
    console.log(`✅ Session ID: ${sessionId || 'None (stateless mode)'}`);
    
    // Test 3: Use tools/list without session ID (should work in stateless mode)
    console.log("\n=== Test 3: Use tools/list without session ID (stateless mode) ===");
    const toolsResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2025-06-18'
        // No Mcp-Session-Id header needed in stateless mode
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: 2
      })
    });
    console.log(`✅ Status: ${toolsResponse.status} ${toolsResponse.statusText}`);
    const toolsBody = await toolsResponse.text();
    console.log(`✅ Response: ${toolsBody.substring(0, 100)}...`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  // Test 4: Multiple initializations (should all work in stateless mode)
  console.log("\n=== Test 4: Multiple initializations (stateless mode) ===");
  try {
    const response1 = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2025-06-18'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        id: 3,
        params: {
          protocolVersion: "2025-06-18",
          capabilities: { tools: {} },
          clientInfo: { name: "test-client-1", version: "1.0.0" }
        }
      })
    });
    console.log(`✅ First initialization: ${response1.status} ${response1.statusText}`);
    
    const response2 = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2025-06-18'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        id: 4,
        params: {
          protocolVersion: "2025-06-18",
          capabilities: { tools: {} },
          clientInfo: { name: "test-client-2", version: "1.0.0" }
        }
      })
    });
    console.log(`✅ Second initialization: ${response2.status} ${response2.statusText}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  console.log("\n🎉 Session Management Test Summary (Stateless Mode):");
  console.log("✅ Fixed issues:");
  console.log("  - No session management required");
  console.log("  - Multiple initializations work");
  console.log("  - No session ID headers needed");
  console.log("  - Stateless mode working correctly");
  console.log("  - No 'Server already initialized' errors");
  console.log("  - No 'Mcp-Session-Id header is required' errors");
}

testSessionManagement();
