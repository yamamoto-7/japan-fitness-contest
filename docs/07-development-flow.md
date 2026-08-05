# 開発フロー

## 1. 基本方針

- `main` は本番リリース可能な状態を維持する
- `develop` を統合ブランチとして運用する方針は既存READMEに従う
- 1ブランチ・1プルリクエストは小さく、単一の目的にする
- 実装、テスト、関連ドキュメントを同じプルリクエストへ含める
- 認証、DB移行、本番設定は特にレビューを必須とする

## 2. ブランチ

| Pattern | 用途 | 例 |
| --- | --- | --- |
| `main` | 本番 | - |
| `develop` | 開発統合 | - |
| `feature/*` | 機能開発 | `feature/event-calendar` |
| `fix/*` | 通常の不具合修正 | `fix/calendar-layout` |
| `hotfix/*` | 本番の緊急修正 | `hotfix/admin-auth` |
| `docs/*` | 文書のみ | `docs/api-spec` |

小規模な単独開発で `develop` が負担になる場合はGitHub Flowへ変更できますが、変更時はREADMEと本文書を同時に更新します。

## 3. ローカル開発

```bash
npm install
npm run db:up
npm run dev
```

開発サーバーは通常 `http://localhost:3000`、ローカルPostgreSQLはホスト側の競合を避けて `localhost:5433` で公開します。管理者認証を利用する場合は `.env.local` に `AUTH_SECRET`、`ADMIN_EMAIL`、`ADMIN_PASSWORD_HASH` を設定します。DB接続には次の値を設定します。

```env
DATABASE_URL=postgresql://japan_fitness:local_password@localhost:5433/japan_fitness
```

### ローカルPostgreSQLの操作

| 操作 | コマンド |
| --- | --- |
| 起動し、ヘルスチェック完了まで待機 | `npm run db:up` |
| ログを表示 | `npm run db:logs` |
| 停止 | `npm run db:down` |
| 状態確認 | `docker compose ps` |
| マイグレーション適用 | `npm run db:migrate` |
| 開発用大会データ投入 | `npm run db:seed` |

`npm run db:down` では名前付きボリュームを残すため、次回起動時もデータが維持されます。`docker compose down -v` はローカルDBを完全に削除する場合だけ使用します。

### CRUD実装へ進むフロー

1. `npm run db:up` でPostgreSQLを起動する
2. Drizzleの `events` スキーマとDB接続を実装する（完了）
3. `drizzle.config.ts` とマイグレーション用npm scriptsを追加する（完了）
4. `npm run db:generate` でマイグレーションを生成し、SQLをレビューする
5. `npm run db:migrate` でローカルDBへマイグレーションを適用する
6. `npm run db:seed` で開発用の架空大会データを投入する（完了）
7. 認証必須の大会CRUD API・DALを実装する（完了）
8. 管理画面の大会一覧・登録・編集・削除・公開切替を実装する（完了）
9. 非公開大会が公開APIへ出ないことをDB統合テストで確認する

`db:generate`、`db:migrate`、`db:studio`、`db:seed` scriptsは追加済みです。`db:seed` は固定UUIDとupsertを使うため再実行しても重複しません。

## 4. 推奨実装順序

1. 基盤整理: ディレクトリ、環境変数、共通レイアウト
2. DBサービス選定と開発DB作成
3. Drizzleスキーマ、マイグレーション、シード
4. 公開大会の取得APIとDAL
5. 公開トップ、カレンダー、詳細
6. 認証方式の確定と管理者ログイン
7. 管理大会一覧とCRUD API
8. 登録・編集・削除・公開切替画面
9. エラー、空状態、レスポンシブ、アクセシビリティ対応
10. SEO、構造化データ、サイトマップ、robots
11. 統合テストと受け入れ確認
12. Vercel・本番DB設定、デプロイ、動作確認

## 5. 日々の作業フロー

1. Issueまたはタスクに目的と受け入れ条件を書く
2. `develop` の最新状態から作業ブランチを作る
3. 必要なNext.js 16.3.0の同梱ガイドを `node_modules/next/dist/docs/` で確認する
4. 小さな単位で実装とテストを行う
5. lint、テスト、buildをローカルで実行する
6. 仕様との差異があればdocsを更新する
7. Conventional Commitsでコミットする
8. プルリクエストを作成し、レビュー後にマージする

## 6. コミットルール

Conventional Commitsを使用します。

| Type | 用途 |
| --- | --- |
| `feat` | 新機能 |
| `fix` | 不具合修正 |
| `docs` | ドキュメント |
| `refactor` | 振る舞いを変えない設計改善 |
| `test` | テスト |
| `chore` | 設定、依存関係、保守 |
| `ci` | CI/CD |
| `perf` | 性能改善 |
| `style` | コード整形のみ |

## 7. 品質ゲート

```bash
npm run lint
npm run build
```

テスト基盤導入後は単体・統合・E2Eテストを追加します。レビューでは、受け入れ条件、公開境界、認証・認可、入力検証、機密情報、レスポンシブ、アクセシビリティ、DB移行、文書との一致を確認します。

## 8. テスト方針

| 種別 | 主な対象 |
| --- | --- |
| 単体 | Zodスキーマ、日付判定、DTO変換、ビジネスルール |
| DB統合 | 公開条件、期間重複検索、CRUD、制約、ページネーション |
| API統合 | ステータス、認証、入力エラー、レスポンス形式 |
| コンポーネント | フォームエラー、空状態、主要操作 |
| E2E | 公開閲覧、ログイン、登録、編集、公開、削除 |

重点回帰テスト:

- 非公開大会が公開APIと公開ページに出ない
- 非公開IDへの直接アクセスが404になる
- 未認証で管理APIを変更できない
- 開始日より前の終了日を保存できない
- 複数日・月またぎ大会が対象期間に表示される

## 9. デプロイ

### Preview

- プルリクエストごとにVercel Previewを作成する
- Preview用DBを本番DBから分離する
- 本番用シークレットをPreviewへ不要に配布しない

### Production

1. マイグレーションSQLを確認する
2. 必要ならDBバックアップを取得する
3. 本番DBへ互換性のある変更を先に適用する
4. `main` をVercelへデプロイする
5. トップ、カレンダー、詳細、ログイン、CRUDをスモークテストする
6. エラーログと無料枠使用量を確認する

DB変更では、旧アプリと新スキーマが短時間共存できる展開（expand → deploy → contract）を推奨します。

## 10. ロールバック

- アプリ不具合: 直前の正常なVercelデプロイへ戻す
- DB不具合: 原則として前方修正する。破壊的変更は事前の復旧手順に従う
- 公開データ誤り: 対象大会を非公開にしてから修正する
- 認証事故: セッション・シークレットを失効し、影響を確認する
