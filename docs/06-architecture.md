# システム構成

## 1. 技術スタック

| 区分 | 技術 | 状態 |
| --- | --- | --- |
| Framework | Next.js 16.3.0 App Router | 導入済み |
| Language | TypeScript | 導入済み |
| UI | React 19.2.8 / Tailwind CSS 4 | 導入済み |
| API | Hono 4 | 依存導入済み、未実装 |
| Validation | Zod 4 | 依存導入済み、未実装 |
| Form | React Hook Form | 依存導入済み、未実装 |
| ORM | Drizzle ORM / Drizzle Kit | 依存導入済み、未実装 |
| Database | PostgreSQL（NeonまたはSupabase） | 未決定 |
| Authentication | Auth.js予定 | 未導入・未決定 |
| Hosting | Vercel | 未設定 |

## 2. 論理構成

```text
ブラウザ
  ├─ 公開画面（Server Components中心）
  └─ 管理画面（フォーム等のみClient Components）
          │
          ▼
Next.js App Router
  ├─ Page / Layout / Metadata
  └─ app/api/[[...route]]/route.ts
          │
          ▼
Hono API（入力検証、認証・認可、ユースケース、DTO変換）
          │
          ▼
Data Access Layer / Drizzle ORM
          │
          ▼
PostgreSQL
```

Next.js 16同梱ドキュメントに従い、APIはRoute Handlerの `route.ts` で公開します。管理画面の保護はレイアウトで隠すだけにせず、各データアクセスとRoute Handlerの近くで認証・認可を行います。

## 3. 責務分離

| 層 | 責務 |
| --- | --- |
| Pages / Components | 表示、操作、アクセシビリティ。秘密情報を扱わない |
| Hono Routes | HTTP入出力、ステータス、認証要求、検証呼び出し |
| Use Cases / Services | 大会の取得・登録・更新・削除、ビジネスルール |
| DAL / Repositories | DBクエリ、公開条件、トランザクション |
| Schemas / DTO | 入力検証、公開可能フィールドの限定、型変換 |
| Drizzle Schema | テーブル、制約、インデックス、マイグレーション元定義 |

ページからDBへ直接アクセスする場合も、公開条件や認可を共有DALに集約し、APIと異なるルールにならないようにします。

## 4. 推奨ディレクトリ構成

```text
app/
├─ (public)/
│  ├─ page.tsx
│  └─ events/
│     ├─ page.tsx
│     └─ [id]/page.tsx
├─ admin/
│  ├─ login/page.tsx
│  ├─ page.tsx
│  └─ events/
│     ├─ page.tsx
│     ├─ new/page.tsx
│     └─ [id]/edit/page.tsx
├─ api/[[...route]]/route.ts
├─ sitemap.ts
├─ robots.ts
├─ opengraph-image.*
└─ layout.tsx
components/
├─ ui/
├─ events/
└─ admin/
lib/
├─ api/
├─ auth/
├─ db/
├─ dal/
├─ schemas/
└─ utils/
drizzle/
tests/
docs/
```

Route Group `(public)` はURLへ影響せず、公開側レイアウトを整理するための案です。Hono統合のcatch-all Route Handlerは採用するアダプターの互換性を小さな検証実装で確認してから確定します。

## 5. データ取得・キャッシュ

- 公開ページはServer Componentsを基本とする
- 公開一覧・詳細の更新反映要件に応じ、動的取得または再検証を選択する
- 管理画面と管理APIは常に最新データを扱い、共有公開キャッシュへ載せない
- 登録・更新・削除・公開切替後は、トップ、一覧、対象詳細のキャッシュを無効化する
- キャッシュ戦略の初期案は更新直後に反映する方式とする

Next.jsのキャッシュ仕様はバージョン依存性が高いため、実装時には `node_modules/next/dist/docs/` の当該バージョン文書を再確認します。

## 6. 認証・認可

- 元要件はAuth.jsを予定しているが、パッケージと方式は未決定
- Phase 1 はメールアドレス＋パスワードの管理者認証を想定
- セッションはサーバー側で検証し、Cookieへ機密情報を直接保存しない
- 管理ページ、管理API、更新・削除直前のデータアクセスで認証・認可する
- 公開用クエリでは常に `is_published = true` を条件に含める

## 7. 環境変数案

| Name | 用途 | 公開可否 |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL接続 | 非公開 |
| `AUTH_SECRET` | セッション署名・暗号化 | 非公開 |
| `NEXT_PUBLIC_SITE_URL` | サイトの正規URL、メタデータ生成 | 公開 |

認証ライブラリやDBサービス固有の変数は選定後に追加します。`.env.example` には値を入れず変数名と説明だけを記載します。

## 8. ログ・監視

- APIエラーに追跡可能なrequest IDを付与する
- HTTPメソッド、パス、ステータス、処理時間、request IDを記録する
- パスワード、セッション、Cookie、接続文字列、個人情報をログに残さない
- Vercelのログと無料枠の範囲で開始し、必要に応じ監視サービスを検討する
- 404と入力エラーは通常の利用として扱い、500系を優先的に調査する
