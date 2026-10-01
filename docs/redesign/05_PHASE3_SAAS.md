# 05. Phase 3 — AI Coaching SaaS化(承諾済み)

主力プロダクト。Phase 2完了・検証合格後に着手。

## S1. Supabase(認証 + ユーザーデータ)

`.env.local`(コミット禁止): `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
`SUPABASE_SERVICE_ROLE_KEY`(サーバーのみ) / `OPENROUTER_API_KEY` / `STRIPE_SECRET_KEY` /
`STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_SITE_URL`。

`src/lib/supabase/client.ts`(browser) と `server.ts`(RSC/route用、`@supabase/ssr`)を作る。
**service roleキーはroute handlerのStripe webhook等でのみ使用。**

### スキーマ(migration: `supabase/migrations/0001_init.sql`)

```sql
-- ユーザープロファイル(auth.usersと1:1)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  locale text not null default 'ja',
  rank_tier text,             -- warrior..mythical-glory
  rank_stars int,
  main_heroes text[] default '{}',   -- hero slug
  preferred_role text,        -- Role
  preferred_lane text,        -- Lane
  playstyle text,             -- aggressive|balanced|passive
  goals text[] default '{}',
  plan text not null default 'free',  -- free|pro
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 試合記録(手入力。将来スクショ解析)
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  hero_slug text not null,
  lane text,
  result text not null,            -- victory|defeat
  kills int not null, deaths int not null, assists int not null,
  gold int, duration_seconds int,
  enemy_heroes text[] default '{}',
  ally_heroes text[] default '{}',
  notes text,                      -- ユーザーの自由記述
  played_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- コーチレポート(AI出力の永続化)
create table coach_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  match_id uuid references matches on delete cascade,
  report jsonb not null,           -- CoachReportスキーマ
  model text not null,
  input_tokens int, output_tokens int, cost_usd numeric(10,6),
  patch text,
  created_at timestamptz default now()
);

-- 利用量(quota + コスト追跡)
create table usage_events (
  id bigserial primary key,
  user_id uuid references auth.users on delete cascade,
  anon_key text,                   -- 未登録体験用(IPハッシュ+日付)
  kind text not null,              -- match_review|build_coach|counter_coach|followup
  model text, input_tokens int, output_tokens int, cost_usd numeric(10,6),
  created_at timestamptz default now()
);
create index on usage_events (user_id, created_at desc);
```

RLS: profiles/matches/coach_reports は `auth.uid() = user_id` のみselect/insert/update。
usage_events はユーザーからのselectのみ許可、insertはservice role。

Repository層に `src/repositories/userRepository.ts` / `matchRepository` の実DB版を追加。
**既存の静的データ版は「サンプル閲覧モード(未ログイン)」として残す。**

## S2. AIコーチAPI

```
src/app/api/coach/analyze/route.ts   POST 試合データ→CoachReport生成
src/app/api/coach/followup/route.ts  POST レポートへの追質問(軽量モデル)
src/lib/coach/schema.ts              zod: CoachInput / CoachReport の検証
src/lib/coach/quota.ts               quota判定・usage記録
src/lib/coach/models.ts              モデルルーティング表
src/lib/coach/context.ts             Knowledge選択注入(全部渡さない)
```

### 生成フロー(必ずこの順序)
1. `zod` で入力検証 → 不正は400。
2. quota判定(S3)。超過は402(Proへの導線を返す)。
3. `context.ts`: 対象ヒーロー+敵味方ヒーローの
   {name, roles, lane, tier, skills要約, counterEdges} と現行パッチ、
   ユーザープロファイル、直近3レポートの focusPoints のみを注入。
   **Knowledge全量やヒーロー133体を渡さない(コスト対策)。**
4. `services/ai` の Provider で structured output(既存 `CoachReport` スキーマ)。
   `SYSTEM_PROMPT` に「Knowledgeにない事実(スキル名・数値)を生成しない」「日本語/{locale}で回答」を明記。
5. 出力を zod 検証 → 失敗は1回だけリトライ → なお失敗なら500(偽レポートを返さない)。
6. `coach_reports` へ保存 + `usage_events` へトークン/コスト記録。

### モデルルーティング(`models.ts`)
| 用途 | モデル | 理由 |
|---|---|---|
| フル分析(match_review) | `anthropic/claude-sonnet-5` (OpenRouter経由) | 品質が収益の源泉 |
| 追質問(followup) | `anthropic/claude-haiku-4-5-20251001` | 低コスト |
| ビルド/カウンター提案 | Knowledge Layerから**AI不要で生成**、補足文のみ軽量モデル | 原価ゼロ化 |

APIキー未設定時: 500ではなく `sampleReport` を返し、UIに「サンプル(APIキー未設定)」と明示。
**AI処理を行ったように偽装しない。**

## S3. Quota / Entitlements

`src/lib/coach/quota.ts`:
| プラン | フル分析 | 追質問 | 備考 |
|---|---|---|---|
| 未登録(anon) | 生涯1回 | 0 | IPハッシュ+UAで識別。体験用 |
| free(登録) | 月3回 | レポートあたり3件 | |
| pro | 日5回・月100回 | 無制限(日50) | 上限は乱用防止 |

判定は `usage_events` の集計。超過時レスポンス: `{ error: "quota_exceeded", plan, resetAt, upgradeUrl }`。

## S4. UI

- `/coach`(未ログイン): 製品紹介 + **無料体験フォーム**(ヒーロー/結果/KDA/時間/敵構成/自由記述)
  → 分析実行 → 結果は「総合スコア + 最大の弱点1つ + 今日直せる改善1つ」を全文表示、
  それ以下(6カテゴリ詳細・練習メニュー・推移)は `components/coach/LockedSection.tsx` でぼかし+
  「Proで“何が上手くなるか”」の文言。→ 登録CTA。
- `/dashboard`(要ログイン・noindex): 現在ランク / メインヒーロー勝率 / 直近パフォーマンス /
  最大の弱点・強み / 今日のフォーカス / 推奨練習 / 進捗グラフ / 最近のレポート。
  既存 `profile` の部品を実データに接続して再構成。
- `/pricing`: Free/Proの比較。価格は監査報告書⑤の案(日本¥580〜780 等)から**CEO確定後に**入れる。
  確定まではCTAを「事前登録」にしておく(偽の価格表示をしない)。
- モバイル: コーチ結果の1画面目に「スコア・最重要改善・次の3アクション」が収まること(§28)。

## S5. Stripe

`src/app/api/billing/checkout/route.ts`(Checkout Session作成) /
`src/app/api/billing/webhook/route.ts`(署名検証 → profiles.plan更新)。
webhookは `runtime = "nodejs"`、raw body で署名検証。**価格IDは環境変数**。

## 受け入れ基準

- [ ] 未ログインで無料分析が1回実行でき、2回目は登録導線が出る
- [ ] APIキーなし環境で「サンプル」と明示されたレポートが返る(偽装なし)
- [ ] 登録→プロファイル入力→試合登録→分析→dashboardに反映、の一周が動く
- [ ] `usage_events` にトークン数とコストが記録される
- [ ] zod検証失敗時に不正レポートが表示されない
- [ ] RLSで他ユーザーのデータが取得できない(別アカウントで検証)
- [ ] モバイル375pxでコーチ結果の核が1画面目に収まる
- [ ] tsc / lint / build / audit合格、PROGRESS.txt更新
