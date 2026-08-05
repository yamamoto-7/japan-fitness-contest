# データベース定義

## 1. 方針

- PostgreSQLを使用する
- ORMとマイグレーションはDrizzle ORM / Drizzle Kitを使用する
- DBサービスはNeonまたはSupabaseから選定する
- DB列はsnake_case、TypeScript/APIはcamelCaseを使用する
- 開催日は `date`、監査日時はタイムゾーン付き日時を使用する
- IDはPostgreSQLのUUIDを使用する設計案とする

## 2. ER概要

```text
organizations 1 ─── N events
  └─ Phase 2で results、event_athletes 等との関連を追加予定
```

Phase 1の管理者は1名固定で環境変数から取得するため、`admins` テーブルは作成しません。監査要件が必要になった場合は管理者テーブルと `created_by`、`updated_by` を追加します。

## 3. `organizations` テーブル

| Column | PostgreSQL型 | Null | Default | 制約・用途 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | UUID生成 | 主キー |
| `name` | `varchar(100)` | NO | なし | 団体名、空文字不可、一意 |
| `created_at` | `timestamptz` | NO | `now()` | 作成日時 |
| `updated_at` | `timestamptz` | NO | `now()` | 更新時にアプリ側で変更 |

団体名の重複は `organizations_name_unique_idx` で防ぎます。大会から参照されている団体の削除は外部キーで制限します。

## 4. `events` テーブル

| Column | PostgreSQL型案 | Null | Default | 制約・用途 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | UUID生成 | 主キー |
| `name` | `varchar(200)` | NO | なし | 大会名、空文字不可 |
| `organization_id` | `uuid` | NO | なし | `organizations.id` への外部キー、削除制限 |
| `start_date` | `date` | NO | なし | 開始日 |
| `end_date` | `date` | NO | なし | 終了日、開始日以降 |
| `location` | `varchar(255)` | NO | なし | 開催地、空文字不可 |
| `official_url` | `text` | YES | `NULL` | 公式URL |
| `description` | `text` | YES | `NULL` | 説明・注意事項 |
| `is_published` | `boolean` | NO | `false` | 公開状態 |
| `created_at` | `timestamptz` | NO | `now()` | 作成日時 |
| `updated_at` | `timestamptz` | NO | `now()` | 更新時にアプリ側で変更 |

制約案:

```sql
CHECK (char_length(trim(name)) > 0)
CHECK (char_length(trim(location)) > 0)
CHECK (end_date >= start_date)
CHECK (official_url IS NULL OR official_url ~ '^https?://')
CHECK (description IS NULL OR char_length(description) <= 10000)
```

URLの厳密な検証はアプリケーション層で行い、DB制約は最低限の防御とします。

### インデックス案

| Name | Columns | 目的 |
| --- | --- | --- |
| `events_pkey` | `id` | 主キー検索 |
| `events_public_date_idx` | `is_published, start_date, end_date` | 公開一覧、カレンダー |
| `events_organization_id_idx` | `organization_id` | 団体結合・絞り込み |
| `events_updated_at_idx` | `updated_at DESC` | 更新情報、管理一覧 |

初期段階では過剰なインデックスを避け、実行計画と実測に基づいて変更します。

## 5. 将来拡張: `admins` テーブル

複数管理者または権限管理が必要になった時点で、以下のテーブルを追加する案とします。Phase 1のマイグレーション対象には含めません。

| Column | PostgreSQL型案 | Null | Default | 制約・用途 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | UUID生成 | 主キー |
| `name` | `varchar(100)` | NO | なし | 表示名、空文字不可 |
| `email` | `varchar(254)` | NO | なし | ログインID、一意 |
| `password_hash` | `text` | NO | なし | 安全なパスワードハッシュ |
| `created_at` | `timestamptz` | NO | `now()` | 設計案として追加 |
| `updated_at` | `timestamptz` | NO | `now()` | 設計案として追加 |

- メールアドレスはtrim・小文字化し、大文字小文字を区別しない一意制約を設定する
- `password_hash` はAPIレスポンス、ログ、クライアントコードへ出さない
- Auth.jsアダプター採用時は標準スキーマとの整合を取り、本定義を置き換える可能性がある

## 6. Drizzle上の名前対応

| DB | TypeScript |
| --- | --- |
| `start_date` | `startDate` |
| `end_date` | `endDate` |
| `organization_id` | `organizationId` |
| `official_url` | `officialUrl` |
| `is_published` | `isPublished` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

入力検証、API DTO、DBスキーマは役割を分けます。DBレコードをそのまま公開APIへ返さず、公開用DTOで許可フィールドだけを選択します。

## 7. マイグレーション運用

1. Drizzleスキーマを変更する
2. マイグレーションを生成する
3. 生成SQLをレビューする
4. 開発・検証DBへ適用する
5. アプリと移行後スキーマのテストを行う
6. 本番デプロイ手順に従い適用する

適用済みマイグレーションを直接書き換えません。修正は新しいマイグレーションで行います。破壊的変更ではバックアップと復旧手順を用意します。

## 8. 初期データ

- Phase 1の管理者メールアドレスとハッシュ済みパスワードはサーバー側環境変数で設定する
- 管理者のパスワード、ハッシュ、セッション署名鍵をGitへコミットしない
- 団体と大会の開発用シードは架空データと明示する
- 実在大会データには公式URLと確認日を運用上記録することを推奨する
