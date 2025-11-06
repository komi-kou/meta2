#!/usr/bin/env node

/**
 * GoMarble API シンプル接続テスト
 * SSEエンドポイントへの直接接続を試みる
 *
 * Usage: GOMARBLE_API_KEY=your_key node test-gomarble-simple.mjs
 */

const GOMARBLE_API_KEY = process.env.GOMARBLE_API_KEY || '';

if (!GOMARBLE_API_KEY) {
  console.error('❌ Error: GOMARBLE_API_KEY environment variable is not set');
  console.error('Usage: GOMARBLE_API_KEY=your_key node test-gomarble-simple.mjs');
  process.exit(1);
}

async function testGomarbleConnection() {
  console.log('🔍 GoMarble API接続テスト\n');

  // Test 1: Basic SSE endpoint
  console.log('Test 1: SSE endpoint (GET)');
  console.log('URL: https://gomarble.ai/mcp-api/sse');
  try {
    const response = await fetch('https://gomarble.ai/mcp-api/sse', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GOMARBLE_API_KEY}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response:', text.substring(0, 500));
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
  }

  // Test 2: Alternative endpoint
  console.log('Test 2: Alternative endpoint (apps.gomarble.ai)');
  console.log('URL: https://apps.gomarble.ai/mcp-api/sse');
  try {
    const response = await fetch('https://apps.gomarble.ai/mcp-api/sse', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GOMARBLE_API_KEY}`,
        'Accept': 'text/event-stream'
      }
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response:', text.substring(0, 500));
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
  }

  // Test 3: Messages endpoint (POST)
  console.log('Test 3: Messages endpoint (POST)');
  console.log('URL: https://gomarble.ai/mcp-api/messages');
  try {
    const response = await fetch('https://gomarble.ai/mcp-api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOMARBLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      })
    });

    console.log('Status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Response:', text);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
  }

  // Test 4: Root endpoint
  console.log('Test 4: Root API endpoint');
  console.log('URL: https://gomarble.ai/mcp-api/');
  try {
    const response = await fetch('https://gomarble.ai/mcp-api/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GOMARBLE_API_KEY}`
      }
    });

    console.log('Status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Response:', text);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
  }

  // Test 5: API key validation
  console.log('Test 5: API key format check');
  console.log('API Key:', GOMARBLE_API_KEY);
  console.log('Length:', GOMARBLE_API_KEY.length);
  console.log('Format: UUID-like?', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(GOMARBLE_API_KEY));
  console.log('');
}

testGomarbleConnection().catch(console.error);
