import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

/**
 * GoMarble MCP クライアント
 * SSE (Server-Sent Events) 経由でGoMarbleのMCPサーバーに接続
 */
class GomarbleClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = null;
    this.transport = null;
  }

  /**
   * GoMarble MCP サーバーに接続
   */
  async connect() {
    try {
      console.log('🔌 GoMarble MCP サーバーに接続中...');
      console.log('📍 Endpoint: https://gomarble.ai/mcp-api/sse');

      const url = new URL("https://gomarble.ai/mcp-api/sse");

      // SSEClientTransportを使用してBearerトークン認証
      this.transport = new SSEClientTransport(url, {
        requestInit: {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      });

      // MCPクライアントを初期化
      this.client = new Client(
        {
          name: "meta-ad-dashboard-test",
          version: "1.0.0"
        },
        {
          capabilities: {
            tools: {},
            resources: {}
          }
        }
      );

      await this.client.connect(this.transport);
      console.log("✅ GoMarble MCP サーバーに接続しました\n");

      // トランスポートイベントハンドラー
      this.transport.onclose = () => {
        console.log("🔌 GoMarble接続が閉じられました");
      };

      this.transport.onerror = (error) => {
        console.error("❌ GoMarble接続エラー:", error);
      };

      return true;
    } catch (error) {
      console.error("❌ GoMarble接続失敗:", error.message);
      throw error;
    }
  }

  /**
   * 利用可能なツール一覧を取得
   */
  async listTools() {
    if (!this.client) {
      throw new Error("クライアントが接続されていません。connect()を先に呼び出してください。");
    }

    try {
      console.log('📋 利用可能なツール一覧を取得中...');
      const tools = await this.client.listTools();
      console.log(`✅ ${tools.tools.length} 個のツールが利用可能です\n`);
      return tools.tools;
    } catch (error) {
      console.error("❌ ツール一覧取得失敗:", error.message);
      throw error;
    }
  }

  /**
   * 連携済みアドアカウント一覧を取得
   */
  async listAdAccounts() {
    if (!this.client) {
      throw new Error("クライアントが接続されていません。connect()を先に呼び出してください。");
    }

    try {
      console.log('📊 連携済みアドアカウント一覧を取得中...');
      const result = await this.client.callTool({
        name: "list_ad_accounts",
        arguments: {}
      });

      const accounts = JSON.parse(result.content[0].text);
      console.log(`✅ ${accounts.data ? accounts.data.length : 0} 個のアカウントが見つかりました\n`);
      return accounts;
    } catch (error) {
      console.error("❌ アカウント一覧取得失敗:", error.message);
      throw error;
    }
  }

  /**
   * アドアカウントのインサイトデータを取得
   * @param {string} accountId - 広告アカウントID (例: "act_123456789")
   * @param {object} options - オプション設定
   */
  async getAdAccountInsights(accountId, options = {}) {
    if (!this.client) {
      throw new Error("クライアントが接続されていません。connect()を先に呼び出してください。");
    }

    const {
      datePreset = "last_7d",  // last_7d, last_30d, etc.
      fields = [
        "spend",
        "impressions",
        "clicks",
        "ctr",
        "cpc",
        "cpm",
        "reach",
        "frequency",
        "actions",
        "action_values",
        "cost_per_action_type",
        "purchase_roas"
      ],
      level = "account",
      timeIncrement = 1  // 日別データの場合は1
    } = options;

    try {
      console.log(`📈 ${accountId} のインサイトデータを取得中...`);
      console.log(`   期間: ${datePreset}`);
      console.log(`   フィールド数: ${fields.length}`);

      const result = await this.client.callTool({
        name: "get_adaccount_insights",
        arguments: {
          ad_account_id: accountId,
          date_preset: datePreset,
          fields: fields.join(","),
          level: level,
          time_increment: timeIncrement
        }
      });

      const insights = JSON.parse(result.content[0].text);
      console.log(`✅ インサイトデータ取得完了\n`);
      return insights;
    } catch (error) {
      console.error(`❌ インサイト取得失敗 (${accountId}):`, error.message);
      throw error;
    }
  }

  /**
   * キャンペーン一覧を取得
   */
  async getCampaignsByAccount(accountId, options = {}) {
    if (!this.client) {
      throw new Error("クライアントが接続されていません。");
    }

    const { limit = 10 } = options;

    try {
      console.log(`📊 ${accountId} のキャンペーン一覧を取得中...`);

      const result = await this.client.callTool({
        name: "get_campaigns_by_adaccount",
        arguments: {
          ad_account_id: accountId,
          limit: limit
        }
      });

      const campaigns = JSON.parse(result.content[0].text);
      console.log(`✅ ${campaigns.data ? campaigns.data.length : 0} 個のキャンペーンが見つかりました\n`);
      return campaigns;
    } catch (error) {
      console.error(`❌ キャンペーン一覧取得失敗:`, error.message);
      throw error;
    }
  }

  /**
   * 接続を閉じる
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log("🔌 GoMarble接続を閉じました");
    }
  }
}

export default GomarbleClient;
