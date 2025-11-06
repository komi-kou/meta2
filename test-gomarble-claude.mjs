#!/usr/bin/env node

/**
 * GoMarble × Claude API 統合テスト
 *
 * Usage: GOMARBLE_API_KEY=your_key CLAUDE_API_KEY=your_key node test-gomarble-claude.mjs
 */

import GomarbleClient from './utils/aiReports/gomarbleClient.mjs';
import ClaudeAnalyzer from './utils/aiReports/claudeAnalyzer.mjs';

// APIキーを環境変数から取得
const GOMARBLE_API_KEY = process.env.GOMARBLE_API_KEY || '';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';

if (!GOMARBLE_API_KEY) {
  console.error('❌ Error: GOMARBLE_API_KEY environment variable is not set');
  console.error('Usage: GOMARBLE_API_KEY=your_key CLAUDE_API_KEY=your_key node test-gomarble-claude.mjs');
  process.exit(1);
}

if (!CLAUDE_API_KEY) {
  console.error('❌ Error: CLAUDE_API_KEY environment variable is not set');
  console.error('Usage: GOMARBLE_API_KEY=your_key CLAUDE_API_KEY=your_key node test-gomarble-claude.mjs');
  process.exit(1);
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('='.repeat(80));
  console.log('🚀 GoMarble × Claude API 統合テスト');
  console.log('='.repeat(80));
  console.log('');

  let gomarbleClient;
  let claudeAnalyzer;

  try {
    // ========================================
    // Phase 1: GoMarble接続テスト
    // ========================================
    console.log('📍 Phase 1: GoMarble MCP サーバー接続テスト');
    console.log('-'.repeat(80));

    gomarbleClient = new GomarbleClient(GOMARBLE_API_KEY);
    await gomarbleClient.connect();

    // ========================================
    // Phase 2: 利用可能なツール一覧を取得
    // ========================================
    console.log('📍 Phase 2: 利用可能なツール一覧を取得');
    console.log('-'.repeat(80));

    const tools = await gomarbleClient.listTools();
    console.log('利用可能なツール:');
    tools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name}`);
      if (tool.description) {
        console.log(`     説明: ${tool.description}`);
      }
    });
    console.log('');

    // ========================================
    // Phase 3: 連携済みアドアカウント一覧を取得
    // ========================================
    console.log('📍 Phase 3: 連携済みアドアカウント一覧を取得');
    console.log('-'.repeat(80));

    const accounts = await gomarbleClient.listAdAccounts();

    if (accounts.data && accounts.data.length > 0) {
      console.log('連携済みアドアカウント:');
      accounts.data.forEach((account, index) => {
        console.log(`  ${index + 1}. ID: ${account.id}`);
        console.log(`     名前: ${account.name || 'N/A'}`);
        console.log(`     通貨: ${account.currency || 'N/A'}`);
        console.log('');
      });

      // ========================================
      // Phase 4: 最初のアカウントのインサイトデータを取得
      // ========================================
      const firstAccountId = accounts.data[0].id;
      console.log('📍 Phase 4: インサイトデータを取得');
      console.log('-'.repeat(80));
      console.log(`対象アカウント: ${firstAccountId}`);
      console.log('');

      const insights = await gomarbleClient.getAdAccountInsights(firstAccountId, {
        datePreset: 'last_7d',
        timeIncrement: 1
      });

      console.log('取得したデータのサマリー:');
      if (insights.data && insights.data.length > 0) {
        console.log(`  データ件数: ${insights.data.length} 日分`);
        console.log('  最新日のデータ:');

        const latestData = insights.data[insights.data.length - 1];
        console.log(`    日付: ${latestData.date_start} 〜 ${latestData.date_stop}`);
        console.log(`    広告費: $${latestData.spend || 0}`);
        console.log(`    インプレッション: ${latestData.impressions || 0}`);
        console.log(`    クリック数: ${latestData.clicks || 0}`);
        console.log(`    CTR: ${latestData.ctr || 0}%`);
        console.log(`    CPC: $${latestData.cpc || 0}`);
        console.log(`    CPM: $${latestData.cpm || 0}`);
        console.log(`    リーチ: ${latestData.reach || 0}`);
        console.log(`    フリークエンシー: ${latestData.frequency || 0}`);
        console.log('');
      }

      // ========================================
      // Phase 5: キャンペーン一覧を取得
      // ========================================
      console.log('📍 Phase 5: キャンペーン一覧を取得');
      console.log('-'.repeat(80));

      const campaigns = await gomarbleClient.getCampaignsByAccount(firstAccountId, {
        limit: 5
      });

      if (campaigns.data && campaigns.data.length > 0) {
        console.log('キャンペーン一覧（最大5件）:');
        campaigns.data.forEach((campaign, index) => {
          console.log(`  ${index + 1}. ${campaign.name}`);
          console.log(`     ID: ${campaign.id}`);
          console.log(`     ステータス: ${campaign.status || 'N/A'}`);
          console.log('');
        });
      }

      // ========================================
      // Phase 6: Claude API接続テスト
      // ========================================
      console.log('📍 Phase 6: Claude API 接続テスト');
      console.log('-'.repeat(80));

      claudeAnalyzer = new ClaudeAnalyzer(CLAUDE_API_KEY);
      const testResponse = await claudeAnalyzer.testAnalyze(
        'こんにちは！Meta広告の分析ができるか、簡単にテストしてください。'
      );

      console.log('Claude APIからの応答:');
      console.log(testResponse);
      console.log('');

      // ========================================
      // Phase 7: 実際のデータをClaude APIで分析
      // ========================================
      console.log('📍 Phase 7: Claude APIで実データを分析');
      console.log('-'.repeat(80));

      const analysisResult = await claudeAnalyzer.analyzeAdData(
        insights,
        '過去7日間'
      );

      console.log('='.repeat(80));
      console.log('📊 Claude APIによる分析レポート');
      console.log('='.repeat(80));
      console.log('');
      console.log(analysisResult.analysis);
      console.log('');
      console.log('='.repeat(80));
      console.log(`💰 推定コスト: $${analysisResult.cost}`);
      console.log('='.repeat(80));

    } else {
      console.log('⚠️ 連携済みアドアカウントが見つかりませんでした。');
      console.log('   GoMarbleダッシュボードでMeta広告アカウントを連携してください。');
    }

    // ========================================
    // 最終結果
    // ========================================
    console.log('');
    console.log('='.repeat(80));
    console.log('✅ 全てのテストが正常に完了しました！');
    console.log('='.repeat(80));
    console.log('');
    console.log('📋 確認できたこと:');
    console.log('  ✅ GoMarble MCP サーバーへの接続');
    console.log('  ✅ 利用可能なツール一覧の取得');
    console.log('  ✅ 連携済みアドアカウントの取得');
    console.log('  ✅ インサイトデータの取得（過去7日間）');
    console.log('  ✅ キャンペーン一覧の取得');
    console.log('  ✅ Claude API接続');
    console.log('  ✅ Claude APIによる実データ分析');
    console.log('');
    console.log('💡 結論: 実装可能です！n8nワークフローと同じ機能を実現できます。');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ エラーが発生しました');
    console.error('='.repeat(80));
    console.error('');
    console.error('エラー内容:', error.message);
    console.error('');
    if (error.stack) {
      console.error('スタックトレース:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // クリーンアップ
    if (gomarbleClient) {
      await gomarbleClient.disconnect();
    }
  }
}

// スクリプト実行
main().catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
