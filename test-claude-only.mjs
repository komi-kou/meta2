#!/usr/bin/env node

/**
 * Claude API 単独接続テスト
 *
 * Usage: CLAUDE_API_KEY=your_key node test-claude-only.mjs
 */

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';

if (!CLAUDE_API_KEY) {
  console.error('❌ Error: CLAUDE_API_KEY environment variable is not set');
  console.error('Usage: CLAUDE_API_KEY=your_key node test-claude-only.mjs');
  process.exit(1);
}

async function testClaudeAPI() {
  console.log('='.repeat(80));
  console.log('🤖 Claude API 接続テスト');
  console.log('='.repeat(80));
  console.log('');

  try {
    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY
    });

    // Test 1: 簡単なメッセージ
    console.log('📍 Test 1: 基本的なメッセージ送信');
    console.log('-'.repeat(80));

    const message1 = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'こんにちは！Meta広告の分析ができることを確認するため、簡単に自己紹介してください。'
        }
      ]
    });

    console.log('✅ Claude API接続成功！\n');
    console.log('Claude からの応答:');
    console.log(message1.content[0].text);
    console.log('');
    console.log('使用状況:');
    console.log(`  入力トークン: ${message1.usage.input_tokens}`);
    console.log(`  出力トークン: ${message1.usage.output_tokens}`);
    console.log(`  推定コスト: $${calculateCost(message1.usage)}`);
    console.log('');

    // Test 2: Meta広告データのサンプル分析
    console.log('📍 Test 2: サンプル広告データの分析');
    console.log('-'.repeat(80));

    const sampleAdData = {
      data: [
        {
          date_start: '2025-11-01',
          date_stop: '2025-11-01',
          spend: '1250.50',
          impressions: '45000',
          clicks: '1200',
          ctr: '2.67',
          cpc: '1.04',
          cpm: '27.79',
          reach: '32000',
          frequency: '1.41'
        },
        {
          date_start: '2025-11-02',
          date_stop: '2025-11-02',
          spend: '1380.75',
          impressions: '48500',
          clicks: '1350',
          ctr: '2.78',
          cpc: '1.02',
          cpm: '28.47',
          reach: '35000',
          frequency: '1.39'
        },
        {
          date_start: '2025-11-03',
          date_stop: '2025-11-03',
          spend: '1190.25',
          impressions: '42000',
          clicks: '1100',
          ctr: '2.62',
          cpc: '1.08',
          cpm: '28.34',
          reach: '30000',
          frequency: '1.40'
        }
      ]
    };

    const analysisPrompt = `
あなたはMeta広告運用の専門家です。以下の過去3日間の広告パフォーマンスデータを詳細に分析し、実用的なレポートを作成してください。

# 分析対象データ
\`\`\`json
${JSON.stringify(sampleAdData, null, 2)}
\`\`\`

# レポート構成

## 1. 📊 パフォーマンスサマリー
- 3日間の合計値（広告費、インプレッション、クリック）
- 平均CTR、CPC、CPM
- 日別トレンド

## 2. 📈 パフォーマンス評価
- 優れている点
- 改善が必要な点
- 特徴的なパターン

## 3. 💡 具体的なアクション提案（2つ）
実行可能な具体的施策を提案してください。

---
**出力は日本語で、数値は具体的に記載してください。**
`;

    const message2 = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    console.log('✅ サンプルデータの分析完了！\n');
    console.log('='.repeat(80));
    console.log('📊 Claude による分析レポート');
    console.log('='.repeat(80));
    console.log('');
    console.log(message2.content[0].text);
    console.log('');
    console.log('='.repeat(80));
    console.log('使用状況:');
    console.log(`  入力トークン: ${message2.usage.input_tokens}`);
    console.log(`  出力トークン: ${message2.usage.output_tokens}`);
    console.log(`  推定コスト: $${calculateCost(message2.usage)}`);
    console.log('='.repeat(80));
    console.log('');

    // 結果まとめ
    console.log('='.repeat(80));
    console.log('✅ Claude API テスト結果');
    console.log('='.repeat(80));
    console.log('');
    console.log('✅ Claude API は正常に動作しています！');
    console.log('✅ Meta広告データの分析が可能です！');
    console.log('✅ 日本語での詳細レポート生成が可能です！');
    console.log('');
    console.log('💰 コスト試算（このテストの合計）:');
    const totalCost = parseFloat(calculateCost(message1.usage)) + parseFloat(calculateCost(message2.usage));
    console.log(`  合計: $${totalCost.toFixed(4)} (約¥${(totalCost * 150).toFixed(2)})`);
    console.log('');
    console.log('💡 週次レポート（1回）の推定コスト:');
    console.log('  約$0.10-0.15 (¥15-23) ← 実データはもっと大きいため');
    console.log('  月4回で約¥60-90');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ エラーが発生しました');
    console.error('='.repeat(80));
    console.error('');
    console.error('エラー内容:', error.message);

    if (error.status) {
      console.error('HTTP Status:', error.status);
    }

    if (error.error) {
      console.error('Error details:', error.error);
    }

    console.error('');
  }
}

function calculateCost(usage) {
  const inputCost = (usage.input_tokens / 1_000_000) * 3;  // $3 per 1M tokens
  const outputCost = (usage.output_tokens / 1_000_000) * 15; // $15 per 1M tokens
  return (inputCost + outputCost).toFixed(4);
}

// 実行
testClaudeAPI().catch(console.error);
