# Japan Fitness Contest ドキュメント

このディレクトリは、Japan Fitness Contest の要件・設計・開発運用に関する一次資料です。元の要件整理とリポジトリの `README.md` を基に、Phase 1 の実装に着手できる粒度へ整理しています。

## ドキュメント一覧

| 文書 | 内容 |
| --- | --- |
| [01-system-overview.md](./01-system-overview.md) | サービス概要、目的、利用者、スコープ |
| [02-requirements.md](./02-requirements.md) | 機能要件、非機能要件、受け入れ条件 |
| [03-screen-specification.md](./03-screen-specification.md) | 画面一覧、画面遷移、各画面の構成 |
| [04-api-specification.md](./04-api-specification.md) | API共通仕様、各エンドポイント、入出力 |
| [05-database-design.md](./05-database-design.md) | テーブル定義、制約、インデックス |
| [06-architecture.md](./06-architecture.md) | 技術構成、責務、推奨ディレクトリ構成 |
| [07-development-flow.md](./07-development-flow.md) | 開発手順、ブランチ、レビュー、デプロイ |
| [08-design-seo-operations.md](./08-design-seo-operations.md) | UI方針、SEO、運用、収益化 |
| [09-roadmap-and-decisions.md](./09-roadmap-and-decisions.md) | ロードマップ、未決定事項、変更管理 |

## 記述上の区分

- **確定**: 元資料または既存READMEに明記された要件
- **設計案**: Phase 1 を実装可能にするため補完した推奨仕様
- **未決定**: 実装前に意思決定が必要な項目

設計案は実装時の既定値として利用できますが、プロダクト上の判断が必要な項目は [09-roadmap-and-decisions.md](./09-roadmap-and-decisions.md) で管理します。

## 現在の状態

- Next.js 16.3.0 / React 19.2.8 の初期プロジェクト
- Hono、Drizzle ORM、PostgreSQLクライアント、Zod等は依存関係に追加済み
- 画面、API、DBスキーマ、認証は未実装
- 本文書群の対象は主に Phase 1

## 更新ルール

仕様変更を実装する場合は、同じプルリクエストで関連文書も更新します。APIやDBの破壊的変更は、変更理由、移行方法、影響範囲をプルリクエストに記載してください。
