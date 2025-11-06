#!/usr/bin/env node

/**
 * GoMarble MCPプロキシ経由接続テスト
 *
 * 正しいアーキテクチャ:
 * Test Script (MCP Client) ↔ STDIO ↔ MCP Proxy ↔ SSE ↔ GoMarble
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from 'child_process';

const GOMARBLE_API_KEY = process.env.GOMARBLE_API_KEY || '';
const GOMARBLE_SSE_URL = 'https://gomarble.ai/mcp-api/sse';

if (!GOMARBLE_API_KEY) {
  console.error('❌ Error: GOMARBLE_API_KEY environment variable is not set');
  console.error('Usage: GOMARBLE_API_KEY=your_key node test-gomarble-proxy.mjs');
  process.exit(1);
}

async function testGoMarbleViaProxy() {
  console.log('='.repeat(80));
  console.log('🚀 GoMarble MCPプロキシ経由接続テスト');
  console.log('='.repeat(80));
  console.log('');
  console.log('📋 アーキテクチャ:');
  console.log('   Test Script (MCP Client)');
  console.log('   ↕ STDIO');
  console.log('   MCP Proxy (Node.js)');
  console.log('   ↕ SSE + Bearer Token');
  console.log(`   GoMarble Server (${GOMARBLE_SSE_URL})`);
  console.log('');

  let proxyProcess = null;
  let client = null;

  try {
    // ========================================
    // Phase 1: MCPプロキシを起動
    // ========================================
    console.log('📍 Phase 1: MCPプロキシを起動');
    console.log('-'.repeat(80));

    const proxyPath = '/home/user/meta2/mcp-proxy/server/index.js';

    console.log(`プロキシパス: ${proxyPath}`);
    console.log(`SSE URL: ${GOMARBLE_SSE_URL}`);
    console.log(`API Key: ${GOMARBLE_API_KEY.substring(0, 8)}...`);
    console.log('');

    proxyProcess = spawn('node', [
      proxyPath,
      'GoMarble Facebook Ads',
      GOMARBLE_SSE_URL,
      GOMARBLE_API_KEY
    ]);

    // プロキシのログを表示
    proxyProcess.stderr.on('data', (data) => {
      console.log(`[Proxy] ${data.toString().trim()}`);
    });

    proxyProcess.on('error', (error) => {
      console.error('❌ プロキシプロセスエラー:', error.message);
    });

    // プロキシの起動を少し待つ
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ========================================
    // Phase 2: STDIOトランスポートでプロキシに接続
    // ========================================
    console.log('');
    console.log('📍 Phase 2: STDIOトランスポートでプロキシに接続');
    console.log('-'.repeat(80));

    client = new Client(
      {
        name: 'gomarble-test-client',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );

    const transport = new StdioClientTransport({
      command: proxyProcess
    });

    await client.connect(transport);
    console.log('✅ MCPプロキシに接続しました\n');

    // ========================================
    // Phase 3: 利用可能なツール一覧を取得
    // ========================================
    console.log('📍 Phase 3: 利用可能なツール一覧を取得');
    console.log('-'.repeat(80));

    const tools = await client.listTools();
    console.log(`✅ ${tools.tools.length} 個のツールが利用可能です\n`);

    console.log('利用可能なツール:');
    tools.tools.slice(0, 10).forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name}`);
      if (tool.description) {
        console.log(`     ${tool.description}`);
      }
    });

    if (tools.tools.length > 10) {
      console.log(`  ... and ${tools.tools.length - 10} more tools`);
    }
    console.log('');

    // ========================================
    // Phase 4: アドアカウント一覧を取得
    // ========================================
    console.log('📍 Phase 4: 連携済みアドアカウント一覧を取得');
    console.log('-'.repeat(80));

    try {
      const accountsResult = await client.callTool({
        name: 'list_ad_accounts',
        arguments: {}
      });

      const accounts = JSON.parse(accountsResult.content[0].text);
      console.log('✅ アドアカウント一覧取得成功\n');

      if (accounts.data && accounts.data.length > 0) {
        console.log(`連携済みアドアカウント (${accounts.data.length}個):`);
        accounts.data.forEach((account, index) => {
          console.log(`  ${index + 1}. ${account.name || 'N/A'}`);
          console.log(`     ID: ${account.id}`);
          console.log(`     通貨: ${account.currency || 'N/A'}`);
          console.log('');
        });

        // ========================================
        // Phase 5: 最初のアカウントのインサイトデータを取得
        // ========================================
        const firstAccountId = accounts.data[0].id;
        console.log('📍 Phase 5: インサイトデータを取得');
        console.log('-'.repeat(80));
        console.log(`対象アカウント: ${firstAccountId}`);
        console.log('');

        const insightsResult = await client.callTool({
          name: 'get_adaccount_insights',
          arguments: {
            ad_account_id: firstAccountId,
            date_preset: 'last_7d',
            fields: 'spend,impressions,clicks,ctr,cpc,cpm,reach,frequency',
            level: 'account',
            time_increment: '1'
          }
        });

        const insights = JSON.parse(insightsResult.content[0].text);
        console.log('✅ インサイトデータ取得成功\n');

        if (insights.data && insights.data.length > 0) {
          console.log(`データ件数: ${insights.data.length} 日分`);
          console.log('');
          console.log('最新3日分のデータ:');
          insights.data.slice(-3).forEach((day, index) => {
            console.log(`  Day ${insights.data.length - 3 + index + 1} (${day.date_start}):`);
            console.log(`    広告費: $${day.spend || 0}`);
            console.log(`    インプレッション: ${day.impressions || 0}`);
            console.log(`    クリック数: ${day.clicks || 0}`);
            console.log(`    CTR: ${day.ctr || 0}%`);
            console.log(`    CPC: $${day.cpc || 0}`);
            console.log(`    CPM: $${day.cpm || 0}`);
            console.log('');
          });
        }

        // ========================================
        // 最終結果
        // ========================================
        console.log('='.repeat(80));
        console.log('✅ 全てのテストが正常に完了しました！');
        console.log('='.repeat(80));
        console.log('');
        console.log('📋 確認できたこと:');
        console.log('  ✅ MCPプロキシの起動');
        console.log('  ✅ GoMarble SSEサーバーへの接続');
        console.log('  ✅ Bearer Token認証の成功');
        console.log('  ✅ MCP Tools一覧の取得');
        console.log('  ✅ 連携済みアドアカウントの取得');
        console.log('  ✅ 過去7日間のインサイトデータ取得');
        console.log('');
        console.log('💡 結論: GoMarble APIは正常に動作しています！');
        console.log('   MCPプロキシを経由することで、正しく接続できることを確認しました。');
        console.log('');

      } else {
        console.log('⚠️ 連携済みアドアカウントが見つかりませんでした。');
        console.log('   GoMarbleダッシュボードでMeta広告アカウントを連携してください。');
      }

    } catch (error) {
      console.error('');
      console.error('❌ ツール実行エラー:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ エラーが発生しました');
    console.error('='.repeat(80));
    console.error('');
    console.error('エラー内容:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // クリーンアップ
    console.log('');
    console.log('🧹 クリーンアップ中...');

    if (client) {
      try {
        await client.close();
        console.log('✅ クライアント接続を閉じました');
      } catch (err) {
        console.error('⚠️ クライアント切断エラー:', err.message);
      }
    }

    if (proxyProcess) {
      proxyProcess.kill();
      console.log('✅ プロキシプロセスを終了しました');
    }
  }
}

// 実行
testGoMarbleViaProxy().catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
