# 04. Phase 2 — SEO構造 + 情報設計再編(承諾済み)

URL構造変更を含む。Phase 1完了・検証合格後に着手。

## U1. ルート再編(/characters → /heroes + セクションページ)

```
src/app/heroes/page.tsx                 一覧(ロール×レーン両軸フィルタ)
src/app/heroes/[slug]/page.tsx          概要(ステータス・スキン・ストーリー・推奨セット)
src/app/heroes/[slug]/build/page.tsx    ビルド+理由+シミュレーター導線
src/app/heroes/[slug]/counters/page.tsx カウンター(CounterEdge理由付き)
src/app/heroes/[slug]/skills/page.tsx   スキル詳細
```

- 全てSSG(`generateStaticParams`)。セクションはHERO_DETAILSがあるヒーローのみ生成し、
  ないヒーローは概要ページに「準備中」セクション(リンクは無効化しhrefを張らない)。
- 見た目は現行タブと同等(Tabsコンポーネントを`<Link>`ベースの`SectionTabs`に置換、
  activeはpathname判定)。コンテンツはServer Componentで全文HTML出力。
- `/characters` `/characters/[slug]` は削除し、`next.config.ts` の `redirects()` で
  `/characters/:path*` → `/heroes/:path*` に301(既存内部リンクは全て/heroesへ書き換え)。
- メタデータ: 各セクション固有title/description
  (build: 「{name}の最強ビルド【Patch {patch}】装備の理由と状況別分岐」等)。
  JSON-LD: BreadcrumbList全ページ + buildページはItemList。

## U2. レーン軸

- Tierリスト: `/tier-list`(総合) + `/tier-list/[lane]`(5レーンSSG)。laneフィルタは
  canonical JSONの `lane`/`altLanes` を使用。
- ヒーロー一覧・カウンターハブにレーンFilterChips追加。

## U3. i18n基盤(後付けしない構造だけ先に入れる)

**方針: ja完全のまま、多言語の「器」を作る。enは辞書整備完了までnoindexベータ。idは器のみ。**

1. `src/i18n/config.ts`: `locales = ["ja","en"] as const; defaultLocale = "ja"`。
2. URL: `ja` はprefixなし(現行URL維持=SEO資産保護)、`en` は `/en/...`。
   Next.jsのrewrites等で複雑化させず、`src/app/(ja)` 化もしない。実装は:
   - 共有ページコンポーネントを `src/views/` に移し、`src/app/...`(ja) と `src/app/en/...` の
     薄いルートから locale を渡して呼ぶ。Phase 2では **en配下はヒーローDB系のみ**作る。
   - `src/i18n/ja.ts` / `en.ts`: ナビ・共通UI文字列の辞書。`t(locale)` ヘルパ。
3. hreflang: ヒーローDB系ページのmetadataに `alternates.languages`(ja / en / x-default=ja)。
   enページは翻訳完了フラグ(`i18n/status.ts`)が立つまで `robots: {index:false}` + 「Beta」帯。
4. ゲームデータは nameEn / skills(EN名) / items.nameEn で英語表示可能(2-6)。
   説明文(スキル説明・ストーリー)は `en` 未整備の間、enページでは非表示にする(ja文の混在禁止)。

## U4. 鮮度システム

- 2-7の `Freshness` を CURATED_META / HERO_DETAILS / hero-extras(counter) / recommendedBuild に付与。
- 表示: 各セクションページ先頭に DataBadge。「Patch {patch}対応・{date}更新」。
- sitemap の lastModified に連動。
- `docs/redesign/07_DECISION_LOG.md` にパッチ更新運用手順を記録
  (新パッチ→patches.ts追記→影響ヒーローのFreshness更新→build)。

## U5. 内部リンク網(コーチ収束)

- 全ヒーローセクションページ末尾に共通CTA `components/coach/CoachCTA.tsx`:
  「この攻略はあなたの試合ではどうか? → AIコーチで分析(無料)」→ /coach。
- Build⇄Counters⇄Skills⇄概要の相互リンク、related heroes(同レーン同ロール3体)。

## 受け入れ基準

- [ ] /heroes 一覧+133概要+詳細9体×3セクションがビルドされる(静的ページ数増を確認)
- [ ] /characters/* が301で/heroes/*へ
- [ ] タブ相当UIがURL遷移になり、直接アクセスでも表示(JSなしでHTMLに本文が含まれる:
      `curl -s localhost:3002/heroes/layla/build | grep ビルド` で本文確認)
- [ ] /tier-list/[lane] 5ページ生成・パンくずJSON-LD
- [ ] /en/heroes(ベータ・noindex)がビルドされ、ja文字列が混在しない
- [ ] tsc / lint / build / audit合格、PROGRESS.txt更新
