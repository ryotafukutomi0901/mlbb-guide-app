# 01. コーディング構成・技術決定(全フェーズ共通)

## 技術スタック(変更しない)

- Next.js 16.2.10 (App Router, Turbopack) / React 19 / TypeScript 5 / Tailwind CSS 4
- Framer Motion + GSAP(既存の演出資産) / lucide-react / clsx
- Phase 3 で追加: `@supabase/supabase-js` + `@supabase/ssr`(導入済み・未使用) / `zod`(新規devではなくdependencies)
- 決済: Stripe(`stripe` パッケージ、Phase 3)。ホスティングはVercel想定。

## レイヤ構成(既存踏襲+拡張)

```
src/
  app/                    ルート。Phase 2で [locale] 配下へ再編(04参照)
  components/             機能別UI。プリミティブは components/ui/
  data/                   Game Knowledge Layer(静的TS)。多言語対応の正準データ
  repositories/           データアクセス層。ページ/コンポーネントはここ経由のみ
  services/ai/            AI Provider抽象(既存)。route handlerからのみ呼ぶ(client禁止)
  prompts/                プロンプト定義
  lib/                    ユーティリティ
  lib/coach/              Phase 3: quota / models / entitlements / schema
  lib/supabase/           Phase 3: client.ts(browser) / server.ts(RSC・route)
  i18n/                   Phase 2: dictionaries(ja.ts/en.ts) + t() ヘルパ
  providers/              AppStateProvider(既存)
```

## 不変ルール

1. **データアクセスはRepository経由のみ。** コンポーネントから `src/data/*` を直接importしない
   (既存违反箇所はPhase 1で修正対象に含めない。新規コードのみ厳守。TopBar等の既存直参照はPhase 3でSaaS化と同時に置換)。
2. **Server Componentが基本。** `"use client"` はインタラクション必須の葉コンポーネントのみ。
   SEO対象コンテンツ(スキル・ビルド・カウンター本文)をclient専用レンダリングにしない。
3. **AI呼び出しはサーバーのみ。** APIキーがclientバンドルに入る構成は禁止。
4. **ダミーは「サンプル」と明示。** 実装していない機能のボタン・数値・通貨を本物のように見せない。
5. **ゲームデータの文字列をUIにハードコードしない。** 表示名は data/ の正準データから引く。
   UI文字列(ボタン・見出し等)はPhase 2以降 `i18n/` 辞書から引く(Phase 1ではハードコード維持でよい)。
6. **編集部評価データ(Tier・Meta・カウンター)は必ず出典表示。**
   共通コンポーネント `components/ui/DataBadge.tsx`(Phase 1で新設)で
   「編集部評価 / Patch {version} / 更新 {date}」を表示する。
7. コメント・命名・スタイルは既存コードの流儀に合わせる(handbook/02_quality/coding_standard.md)。

## 型の基本形(Phase 1で src/data/types.ts に適用)

```ts
export interface HeroSummary {
  slug: string;          // 正準: 英語名のkebab-case(02のslug規則)
  name: string;          // 日本語クライアント公式表記(02の正準表)
  nameEn: string;        // 英語公式名
  aliases?: string[];    // 検索用別表記(旧表記・音写)。表示には使わない
  roles: Role[];
  lane: Lane;            // 主レーン(必須化)
  altLanes?: Lane[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tier: Tier;            // 編集部評価
  releaseYear: number;
  needsVerification?: boolean; // 日本語表記の裏取り未完フラグ(UIには出さない)
}
```

`HeroMeta` 取得は `getHeroMeta(slug): HeroMeta | undefined` に変更(乱数生成の全廃)。
`getMatchups` はキュレーション済みのみ返す(02のキュレーション規則)。

## 検証コマンド(全フェーズ共通)

```
npx tsc --noEmit && npm run lint && npm run build
npm run start -- -p 3002   # 検証サーバー
node scripts/qa/audit.mjs  # 25ルート×3VPのオーバーフロー/コンソール監査(Phase 1で導入)
```
