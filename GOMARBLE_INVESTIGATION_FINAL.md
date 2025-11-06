# GoMarble連携可否の徹底調査報告

調査日: 2025-11-06

---

## 📊 調査結果サマリー

### ✅ GoMarbleとの連携は**技術的に可能**
公式ドキュメント、GitHub、複数の第三者記事で実例が確認されました。

### ⚠️ ただし、現在404エラーが発生中
SSEエンドポイント `https://gomarble.ai/mcp-api/sse` に接続できない状態です。

---

## 🔍 詳細調査結果

### 1. GoMarbleの公式対応状況

#### ✅ 確認できた接続方法（3つ）

**方法A: Claude Desktop経由（.dxtファイル）【公式推奨】**
- URL: https://www.gomarble.ai/mcp
- 手順:
  1. .dxtファイルをダウンロード
  2. apps.gomarble.aiでログインしてAPIキーを取得
  3. Claude Desktopにドラッグ&ドロップでインストール
- ステータス: ✅ 公式にサポートされている

**方法B: n8n経由（SSEエンドポイント）**
- 公式ドキュメント記載: https://www.gomarble.ai/docs/connect-to-n8n
- エンドポイント: `https://gomarble.ai/mcp-api/sse`
- 認証: Bearer Token (APIキー)
- ステータス: 📄 ドキュメントに記載あり **BUT 404エラー発生中**

**方法C: Python MCPサーバー（ローカル実行）**
- GitHub: https://github.com/gomarble-ai/facebook-ads-mcp-server
- 実行方法: `python server.py --fb-token YOUR_META_TOKEN`
- ステータス: ✅ オープンソースで提供、確実に動作

---

### 2. SSEエンドポイントの調査結果

#### 公式記載
```
エンドポイント: https://gomarble.ai/mcp-api/sse
認証方法: Authorization: Bearer <API_KEY>
用途: MCP Client (n8n, custom implementations)
```

#### 実際のテスト結果
```
❌ HTTP 404 Not Found
エラーメッセージ: "Non-200 status code (404)"
```

#### 404エラーの考えられる原因

**原因1: アカウントの不完全なセットアップ**
- apps.gomarble.aiでログイン済み
- APIキー取得済み
- **BUT** Meta広告アカウントの連携が未完了？

**原因2: 無料プランの制限**
- SSE APIエンドポイントは有料プラン限定の可能性
- 公式ドキュメントには明記されていないが、実際には制限がある可能性

**原因3: エンドポイントの変更**
- ドキュメントが古く、実際のエンドポイントが変更された
- 新しいエンドポイントが別に存在する可能性

**原因4: .dxt経由の接続が必須**
- SSE直接接続は廃止され、.dxt経由のみがサポートされている可能性
- .dxtファイル内に正しいエンドポイント設定が含まれている

---

### 3. 実際の利用例の調査

#### 確認できた実例

**実例1: Madgicxブログ記事（2024年）**
- URL: https://madgicx.com/blog/connect-meta-ads-to-claude
- 内容: GoMarbleのFacebook Ads MCPサーバーを使用してClaudeと連携
- 方法: **Python MCPサーバーをローカル実行**
- 結果: ✅ 動作確認済み

**実例2: Skywork.ai記事（2024年）**
- URL: https://skywork.ai/skypage/en/unlocking-meta-ads-ai-gomarble-facebook/
- 内容: GoMarbleのMCPサーバーの詳細解説
- 方法: **GitHub リポジトリのPythonサーバー**
- 結果: ✅ 動作確認済み

**実例3: n8nテンプレート**
- 公式ドキュメントに記載
- SSEエンドポイント使用
- 結果: 📄 記載あり、実際の動作は**未確認**

---

### 4. apps.gomarble.ai の役割

#### 確認できたこと
```
URL: https://apps.gomarble.ai/
目的: GoMarbleのWebダッシュボード
機能:
  - Google/Email認証でログイン
  - Meta広告アカウントの連携
  - APIキーの生成・管理
  - データの可視化・レポート表示
```

#### APIキーの取得方法
1. https://apps.gomarble.ai/ にログイン
2. 右上のプロフィール画像をクリック
3. "API Key" セクションを開く
4. 「Generate」または「Copy」でAPIキーを取得

---

## 🔧 404エラーの解決方法

### 解決策1: GoMarbleダッシュボードでの確認【推奨】

**確認すべきこと:**

1. **Meta広告アカウントの連携状態**
   - apps.gomarble.ai にログイン
   - 「Integrations」または「Connected Accounts」を探す
   - Meta広告が「Connected」になっているか確認
   - もし「Disconnected」なら連携する

2. **プランの確認**
   - 現在のプランを確認（Free / Pro / Enterprise）
   - SSE APIの利用制限がないか確認
   - 必要に応じてアップグレード

3. **API設定の確認**
   - 「Settings」→「API」または「Developer」セクションを探す
   - 正しいエンドポイントURLが記載されていないか確認
   - もし別のURLがあれば、それを使用

---

### 解決策2: .dxtファイル経由で接続【確実】

GoMarbleが提供している公式の.dxtファイルを使用する方法です。

**手順:**

1. **ダウンロード**
   ```
   https://www.gomarble.ai/mcp
   ```
   から .dxtファイルをダウンロード

2. **Claude Desktopにインストール**
   - Claude Desktopを開く
   - File > Settings > Extensions
   - .dxtファイルをドラッグ&ドロップ

3. **APIキーを設定**
   - apps.gomarble.ai から取得したAPIキーを入力

4. **Node.js設定の確認**
   - エラーが出た場合:
   - Settings → Extensions → Advanced Settings
   - "Use Built-in Node.js for MCP" を無効化
   - Claude Desktopを再起動

**メリット:**
- ✅ 公式にサポート
- ✅ 設定が簡単
- ✅ 確実に動作する可能性が高い

**デメリット:**
- ⚠️ Claude Desktopが必要（我々のWebアプリから直接使用不可）

---

### 解決策3: Python MCPサーバーをローカル実行【最も確実】

GoMarbleのオープンソースPython MCPサーバーを使用する方法です。

**手順:**

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/gomarble-ai/facebook-ads-mcp-server.git
   cd facebook-ads-mcp-server
   ```

2. **Python環境をセットアップ**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Mac/Linux
   # または
   venv\Scripts\activate  # Windows

   pip install -r requirements.txt
   ```

3. **Metaアクセストークンを取得**
   - Meta Developer ポータルにアクセス
   - アクセストークンを生成（`ads_read` 権限必要）

4. **サーバーを起動**
   ```bash
   python server.py --fb-token YOUR_META_ACCESS_TOKEN
   ```

5. **Node.jsアプリから接続**
   ```javascript
   const transport = new StdioClientTransport({
     command: 'python',
     args: [
       '/path/to/facebook-ads-mcp-server/server.py',
       '--fb-token',
       'YOUR_META_ACCESS_TOKEN'
     ]
   });
   ```

**メリット:**
- ✅ 最も確実に動作する
- ✅ GoMarbleのSSEサーバーに依存しない
- ✅ オープンソースで完全制御可能
- ✅ 我々のWebアプリから直接使用可能

**デメリット:**
- ⚠️ Pythonのセットアップが必要
- ⚠️ Metaアクセストークンの取得・管理が必要
- ⚠️ トークンの有効期限管理が必要

---

## 💡 推奨アプローチ

### 短期的解決策（今すぐ動作確認）

**ステップ1: GoMarbleダッシュボードの徹底確認**
1. apps.gomarble.ai にログイン
2. Meta広告アカウントの連携状態を確認
3. プラン・API設定を確認
4. 結果を報告

**ステップ2: 404エラーが解決しない場合**
→ Python MCPサーバー方式に切り替え（最も確実）

---

### 長期的解決策（本番環境）

**推奨: Python MCPサーバー方式**

理由:
- GoMarbleのSSEエンドポイントは不安定（404エラー）
- .dxt方式は我々のWebアプリでは使用不可
- Python方式は完全にコントロール可能で確実

実装:
1. Python MCPサーバーをサーバー上で実行
2. Node.jsアプリからSTDIO経由で接続
3. Metaトークンは安全に管理（環境変数、暗号化DB）

---

## 📋 次のステップ

### 今すぐ確認していただきたいこと

**1. apps.gomarble.ai ダッシュボード確認**

以下をスクリーンショットで確認してください（APIキーは隠す）：

- [ ] 左メニューまたは上部メニューに何がありますか？
- [ ] 「Integrations」「Connected Accounts」セクションはありますか？
- [ ] Meta広告が「Connected」と表示されていますか？
- [ ] 現在のプランは何ですか？（Free / Pro / Enterprise）
- [ ] 「API」「Developer」セクションはありますか？

**2. Meta広告アカウントの連携**

- [ ] Meta広告アカウントは連携済みですか？
- [ ] 連携時にどんな権限を許可しましたか？
- [ ] 連携後に「成功」のメッセージが表示されましたか？

**3. 決断**

上記を確認した上で、どの方式を選択しますか？

- [ ] **オプションA**: GoMarbleダッシュボードの設定を修正してSSE接続を試みる
- [ ] **オプションB**: Python MCPサーバー方式に切り替える（推奨）

---

## 🎯 結論

**GoMarbleとの連携は技術的に可能です。**

ただし、現在の404エラーは以下のいずれかが原因：
1. アカウント設定が不完全
2. 無料プランの制限
3. エンドポイントが変更された
4. .dxt経由のみサポート

**最も確実な解決策: Python MCPサーバー方式**

この方式なら：
- ✅ 確実に動作する（実例多数）
- ✅ GoMarbleのサーバーに依存しない
- ✅ 完全にコントロール可能

次は、GoMarbleダッシュボードの詳細を確認して、最終判断をしましょう。
