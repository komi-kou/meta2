import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude API 分析エンジン
 * Meta広告データを分析してレポートを生成
 */
class ClaudeAnalyzer {
  constructor(apiKey) {
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });
  }

  /**
   * Meta広告データを詳細分析
   * @param {object} data - GoMarbleから取得した広告データ
   * @param {string} period - 分析期間 (例: "過去7日間", "過去30日間")
   */
  async analyzeAdData(data, period = "過去7日間") {
    const prompt = this.buildAnalysisPrompt(data, period);

    try {
      console.log('🤖 Claude APIで広告データを分析中...');
      console.log(`   モデル: claude-sonnet-4-5-20250929`);
      console.log(`   期間: ${period}\n`);

      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8192,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const analysis = message.content[0].text;

      console.log("✅ Claude APIによる分析が完了しました");
      console.log(`   入力トークン: ${message.usage.input_tokens}`);
      console.log(`   出力トークン: ${message.usage.output_tokens}`);
      console.log(`   推定コスト: $${this.calculateCost(message.usage)}\n`);

      return {
        analysis: analysis,
        usage: message.usage,
        model: message.model,
        cost: this.calculateCost(message.usage)
      };
    } catch (error) {
      console.error("❌ Claude API分析エラー:", error.message);
      throw error;
    }
  }

  /**
   * コスト計算
   */
  calculateCost(usage) {
    const inputCost = (usage.input_tokens / 1_000_000) * 3;  // $3 per 1M tokens
    const outputCost = (usage.output_tokens / 1_000_000) * 15; // $15 per 1M tokens
    return (inputCost + outputCost).toFixed(4);
  }

  /**
   * 分析プロンプトを構築
   */
  buildAnalysisPrompt(data, period) {
    return `
あなたはMeta広告運用の専門家です。${period}の広告パフォーマンスデータを詳細に分析し、実用的なレポートを作成してください。

# 分析対象データ
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

# レポート構成（以下の形式で出力してください）

## 1. 📊 アカウント全体サマリー
- 総広告費
- 総インプレッション数
- 総クリック数
- 平均CTR、CPC、CPM
- リーチとフリークエンシー
- コンバージョン関連の指標

## 2. 📈 パフォーマンス評価
- 各指標の評価（優れている点、改善が必要な点）
- 業界平均との比較（可能であれば）
- トレンド分析

## 3. 💡 具体的なアクション提案（優先度順に3つ）
1. **最優先アクション**: [具体的な施策]
   - 期待効果: [数値目標]

2. **重要アクション**: [具体的な施策]
   - 期待効果: [数値目標]

3. **推奨アクション**: [具体的な施策]
   - 期待効果: [数値目標]

## 4. 🎯 総合評価
- 現在のパフォーマンス評価（5段階評価: ⭐⭐⭐⭐⭐）
- 今後の注力ポイント

---

**出力形式**:
- 日本語で記述
- 数値は具体的に記載
- 改善提案は実行可能なレベルで具体的に
- ポジティブな要素も必ず含める
`;
  }

  /**
   * 簡易テスト用の分析
   */
  async testAnalyze(sampleText) {
    try {
      console.log('🤖 Claude API接続テスト中...\n');

      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: sampleText
          }
        ]
      });

      console.log("✅ Claude API接続成功！");
      console.log(`   入力トークン: ${message.usage.input_tokens}`);
      console.log(`   出力トークン: ${message.usage.output_tokens}\n`);

      return message.content[0].text;
    } catch (error) {
      console.error("❌ Claude API接続エラー:", error.message);
      throw error;
    }
  }
}

export default ClaudeAnalyzer;
