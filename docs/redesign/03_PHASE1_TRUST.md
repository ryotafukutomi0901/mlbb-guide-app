# 03. Phase 1 — データ信頼性回復 + 基盤修正(承諾済み)

ページ構成・DB・課金には触れない。URL変更はslug正規化のみ(2-2)。

## T1. ヒーローデータ再構築

1. `src/data/heroes.ts` の `HERO_ROSTER` を `heroes-canonical.json` 全133体で置換
   (`aliases`/`lane`/`altLanes` を含む。型変更は 01 の `HeroSummary`)。
2. `HERO_DETAILS`: slug移行を適用(gusion/angela/fanny/estesはロスターに入ったので
   `HERO_ROSTER.find(...)` スプレッドの二重定義ハックを解消)。ヘルムート(helcurt2)由来データを削除。
3. スキル名修正(2-5の手順)。
4. `src/data/images.ts` の `HERO_IMAGES` を全133体分、命名規則(2-1)で再生成。
5. slug参照の全ファイル一括更新(2-2)。
6. `searchHeroes` を `aliases` 対応に(name/nameEn/aliasesの部分一致)。

## T2. 乱数データ全廃

- `src/repositories/heroRepository.ts`:
  - `getHeroMeta` → `HeroMeta | undefined`(乱数フォールバック削除)。`CURATED_META` に patch/updatedAt追加。
  - `getMatchups` → キュレーションのみ(seededPick削除)。`CounterEdge` 型へ(2-4)。
  - `getTopMeta`/`getRisingHeroes` → CURATED_META保有ヒーローのみを母集団に。
- 呼び出し側(ホーム/meta/counters/characters詳細/HomeHero)を undefined 安全に修正し、
  「データ準備中」/Tierのみ表示へ。`components/ui/DataBadge.tsx` 新設(編集部評価・Patch・更新日)。
- `lib/seed.ts` はガチャ・コーチのサンプルヒートマップ等「明示されたサンプル/演出」用途のみに残す。
  ゲーム事実の生成には使用禁止(コメントで明記)。

## T3. スプラッシュ/遷移の修正

- `SplashScreen.tsx`:
  - `document.hidden` の場合は演出せず即終了(スプラッシュ自体表示しない)。
  - クリック/タップ/Enterでスキップ(`aria-label="スキップ"` のボタン化 or 全面クリック)。
  - GSAP完了に依存しないフェイルセーフ: `setTimeout` 6秒で強制クローズ+overflow復元。
  - visibilitychangeで非表示になったら即クローズ。
- `PageTransition.tsx`: 人工0.62秒ローダーを削除。コンテンツ側のフェードイン(0.2〜0.3s)のみ残す。
  `template.tsx` は維持。

## T4. ダミーUI整理

- `CoachDashboard.tsx`: 「動画をアップロード」「新しい分析」ボタン削除(Phase 3で実物を実装)。
  レポート切替チップの上に「サンプルレポート(実データ連携はAIコーチ正式版で対応)」の帯を表示。
- `CoachReportView.tsx`: タイムラインの再生アイコン(機能なし)を時刻表示のみに変更。
- `TopBar.tsx`: ジェム/チケット表示を削除。プロフィールリンクは維持。
- ホームの「AIコーチレポート」カードに「サンプル」バッジ。

## T5. SEO技術基盤

- `src/app/sitemap.ts`: 全静的ルート+ヒーロー133件+スキン。lastModifiedは鮮度データ(なければビルド日)。
- `src/app/robots.ts`: 全許可 + sitemap参照(/settings /profile /search はnoindex方針でdisallowはしない。
  metadata側 `robots: { index: false }` を /settings /profile /search /analysis /gacha に設定)。
- `layout.tsx` metadata拡張: `metadataBase`(env `NEXT_PUBLIC_SITE_URL`、無ければ `http://localhost:3002`)、
  description強化、OGP/Twitterカードdefault。
- `characters/[slug]`: generateMetadataに description(`{name}({nameEn})の最新ビルド・カウンター・立ち回り。
  Tier{tier}・{ロール}・{レーン}。`)、OGP、canonical。JSON-LD(VideoGameのcharacter扱いは過剰なので
  `BreadcrumbList` + `WebPage`)。
- 主要一覧ページ(characters/tier-list/meta/counters/compendium系/news/events/patches)に
  固有description追加。

## 受け入れ基準(Phase 1完了条件)

- [ ] `heroes-canonical.json` と `HERO_ROSTER` の全項目一致(検証スクリプト、06参照)
- [ ] 旧slug参照 grep 0件 / ヘルムート痕跡 grep 0件(`grep -rn "ヘルムート\|helcurt2" src/`)
- [ ] `seededFloat`/`seededPick` がゲーム事実(メタ・カウンター)経路に存在しない
- [ ] /characters が133体表示、全カードに画像が出る(プレースホルダー0)
- [ ] スプラッシュ: バックグラウンドタブで開いても本文操作可能・6秒で必ず消える・クリックスキップ可
- [ ] ページ遷移に人工遅延なし
- [ ] `curl -s localhost:3002/sitemap.xml` にヒーロー133件 / robots.txt 配信
- [ ] tsc / lint / build / `scripts/qa/audit.mjs`(オーバーフロー0・コンソールエラー0)合格
- [ ] PROGRESS.txt 更新
