# API仕様書

## 1. 概要

Phase 1 のAPIは Next.js App Router の Route Handlerで実装し、`/api` 配下へ公開します。Honoは現時点では使用していません。

| Method | Path | 用途 | 認証 |
| --- | --- | --- | --- |
| GET | `/api/events` | 公開大会一覧 | 不要 |
| GET | `/api/events/:id` | 公開大会詳細 | 不要 |
| GET | `/api/admin/events` | 管理用大会一覧 | 必要 |
| POST | `/api/admin/events` | 大会登録 | 必要 |
| PATCH | `/api/admin/events/:id` | 大会更新 | 必要 |
| DELETE | `/api/admin/events/:id` | 大会削除 | 必要 |
| POST | `/api/auth/login` | 管理者ログイン | 不要 |
| POST | `/api/auth/refresh` | 操作中のセッション延長 | 必要 |
| POST | `/api/auth/logout` | 管理者ログアウト | 必要 |

管理APIは環境変数で定義した固定管理者の署名付きHttpOnly Cookieセッションを検証します。変更系リクエストでは同一オリジンも検証します。

## 2. 共通仕様

- Content-Type: JSON送受信時は `application/json; charset=utf-8`
- 文字コード: UTF-8
- 日付: `YYYY-MM-DD`
- 日時: UTCのISO 8601文字列（例: `2026-08-04T10:30:00.000Z`）
- ID: UUID文字列を設計案とする
- 未知のリクエストフィールドは拒否する設計案
- 管理APIは各ハンドラーとデータアクセス層で認証・認可する

### 2.1 成功レスポンス

単一データ:

```json
{
  "data": {
    "id": "3d42f7b2-5c6d-48dc-bfcb-7c5f7bd7ef6b",
    "name": "大会名"
  }
}
```

一覧データ:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### 2.2 エラーレスポンス

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容を確認してください。",
    "details": [
      { "field": "startDate", "message": "開始日は必須です。" }
    ],
    "requestId": "req_example"
  }
}
```

`details` と `requestId` は該当する場合のみ返します。内部例外やSQLをレスポンスへ含めません。

### 2.3 ステータスコード

| Status | 用途 |
| --- | --- |
| 200 | 取得・更新成功 |
| 201 | 登録成功 |
| 204 | 削除成功。レスポンスボディなし |
| 400 | JSON不正、クエリ不正、入力検証エラー |
| 401 | 未認証 |
| 403 | 認証済みだが権限なし |
| 404 | 対象が存在しない、または公開対象外 |
| 409 | 一意制約違反などの競合 |
| 429 | リクエスト回数制限 |
| 500 | 想定外のサーバーエラー |

## 3. データモデル

### PublicEvent

```json
{
  "id": "3d42f7b2-5c6d-48dc-bfcb-7c5f7bd7ef6b",
  "name": "Japan Fitness Contest 2026",
  "organization": "JBBF",
  "startDate": "2026-08-15",
  "endDate": "2026-08-15",
  "location": "東京都内",
  "officialUrl": "https://example.com/event",
  "description": "大会概要・注意事項",
  "updatedAt": "2026-08-04T10:30:00.000Z"
}
```

`officialUrl` と `description` は未登録時に `null` とします。公開APIは `isPublished`、作成日時、管理者情報を返しません。

### AdminEvent

PublicEventに `isPublished` と `createdAt` を追加します。

### EventInput

```json
{
  "name": "Japan Fitness Contest 2026",
  "organization": "JBBF",
  "startDate": "2026-08-15",
  "endDate": "2026-08-15",
  "location": "東京都内",
  "officialUrl": "https://example.com/event",
  "description": "大会概要・注意事項",
  "isPublished": false
}
```

POSTでは全必須項目を送信します。PATCHでは変更対象だけを送信できますが、更新後の全体が入力規則を満たす必要があります。

## 4. 公開API

### `GET /api/events`

| Query | Type | Default | 説明 |
| --- | --- | --- | --- |
| `page` | integer | `1` | 1以上 |
| `limit` | integer | `20` | 1〜100 |
| `from` | date | なし | 開催期間がこの日以降に重なる大会 |
| `to` | date | なし | 開催期間がこの日以前に重なる大会 |
| `organization` | string | なし | 団体の完全一致 |
| `sort` | string | `startDate` | `startDate` または `updatedAt` |
| `order` | string | `asc` | `asc` または `desc` |

期間指定の重複判定は `start_date <= to AND end_date >= from` とします。`from > to` は400です。該当なしは200と空配列です。

### `GET /api/events/:id`

指定IDの公開済み大会を返します。存在しないID、形式不正なID、非公開大会は情報漏えいを避けるため一律404とします。

## 5. 管理API

### `GET /api/admin/events`

公開APIのクエリに加え、`published`（公開状態）と `q`（大会名・開催地の検索案）を利用できます。公開・非公開を含むAdminEventの配列を返します。

### `GET /api/admin/events/:id`

指定IDのAdminEventを返します。UUID形式不正または対象なしは404です。

### `POST /api/admin/events`

- EventInputを受け取り、大会を登録する
- 成功: `201`、登録済みAdminEvent、`Location: /api/admin/events/{id}`
- 入力不正: `400 VALIDATION_ERROR`
- `isPublished` 省略時: `false`

### `PATCH /api/admin/events/:id`

- 指定フィールドだけを更新する。空オブジェクトは400
- ID、作成日時、更新日時は更新不可
- 成功: `200` と更新後のAdminEvent
- 対象なし: `404 EVENT_NOT_FOUND`

### `DELETE /api/admin/events/:id`

- 大会を物理削除する
- 成功: `204`、対象なし: `404 EVENT_NOT_FOUND`
- リクエストボディは不要

将来、大会結果等が紐づく場合は外部キー制約と削除方式を再検討します。

## 6. エラーコード

| Code | 意味 |
| --- | --- |
| `VALIDATION_ERROR` | 入力・クエリが不正 |
| `UNAUTHENTICATED` | ログインが必要 |
| `FORBIDDEN` | 操作権限がない |
| `EVENT_NOT_FOUND` | 対象大会が見つからない |
| `CONFLICT` | データ競合 |
| `RATE_LIMITED` | リクエスト回数超過 |
| `INTERNAL_ERROR` | 想定外エラー |

## 7. テスト上の注意

- HonoのベースパスとNext.js側のRoute Handlerでパスが二重にならないよう統合テストする
- DBのsnake_caseをAPIのcamelCaseへ変換する
- 公開APIで非公開データを取得できないテストを必須とする
- 管理APIごとに未認証・権限不足を検証する
- 日付境界、複数日開催、月またぎ、ページ上限をテストする
