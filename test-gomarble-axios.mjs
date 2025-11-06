#!/usr/bin/env node

/**
 * GoMarble API 接続テスト (axios使用)
 *
 * Usage: GOMARBLE_API_KEY=your_key node test-gomarble-axios.mjs
 */

import axios from 'axios';

const GOMARBLE_API_KEY = process.env.GOMARBLE_API_KEY || '';

if (!GOMARBLE_API_KEY) {
  console.error('❌ Error: GOMARBLE_API_KEY environment variable is not set');
  console.error('Usage: GOMARBLE_API_KEY=your_key node test-gomarble-axios.mjs');
  process.exit(1);
}

async function testGomarbleWithAxios() {
  console.log('🔍 GoMarble API接続テスト (axios使用)\n');

  // Test 1: SSE endpoint with axios
  console.log('Test 1: SSE endpoint (GET) with axios');
  console.log('URL: https://gomarble.ai/mcp-api/sse');
  try {
    const response = await axios.get('https://gomarble.ai/mcp-api/sse', {
      headers: {
        'Authorization': `Bearer ${GOMARBLE_API_KEY}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000,
      validateStatus: () => true // すべてのステータスコードを受け入れる
    });

    console.log('✅ Status:', response.status, response.statusText);
    console.log('Headers:', response.headers);
    console.log('Response:', typeof response.data === 'string' ? response.data.substring(0, 500) : response.data);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('');
  }

  // Test 2: Messages endpoint (POST)
  console.log('Test 2: Messages endpoint (POST)');
  console.log('URL: https://gomarble.ai/mcp-api/messages');
  try {
    const response = await axios.post('https://gomarble.ai/mcp-api/messages', {
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
    }, {
      headers: {
        'Authorization': `Bearer ${GOMARBLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: () => true
    });

    console.log('✅ Status:', response.status);
    console.log('Response:', response.data);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('');
  }

  // Test 3: Alternative endpoint
  console.log('Test 3: Alternative endpoint (apps.gomarble.ai)');
  console.log('URL: https://apps.gomarble.ai/mcp-api/sse');
  try {
    const response = await axios.get('https://apps.gomarble.ai/mcp-api/sse', {
      headers: {
        'Authorization': `Bearer ${GOMARBLE_API_KEY}`,
        'Accept': 'text/event-stream'
      },
      timeout: 10000,
      validateStatus: () => true
    });

    console.log('✅ Status:', response.status);
    console.log('Response:', typeof response.data === 'string' ? response.data.substring(0, 500) : response.data);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('');
  }

  // Test 4: Root endpoint
  console.log('Test 4: Root API endpoint');
  console.log('URL: https://gomarble.ai/mcp-api/');
  try {
    const response = await axios.get('https://gomarble.ai/mcp-api/', {
      headers: {
        'Authorization': `Bearer ${GOMARBLE_API_KEY}`
      },
      timeout: 10000,
      validateStatus: () => true
    });

    console.log('✅ Status:', response.status);
    console.log('Response:', response.data);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('');
  }

  // Test 5: Basic connectivity test
  console.log('Test 5: Basic connectivity test (root)');
  console.log('URL: https://gomarble.ai/');
  try {
    const response = await axios.get('https://gomarble.ai/', {
      timeout: 10000,
      validateStatus: () => true
    });

    console.log('✅ Status:', response.status);
    console.log('GoMarble website is reachable');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
  }
}

testGomarbleWithAxios().catch(console.error);
