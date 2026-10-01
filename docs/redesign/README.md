# MLBB LAB 再設計 実装仕様書(モデル非依存ハンドオフ文書)

作成: 2026-08-31 / 監査報告書(承認済み)に基づく Phase 1〜3 の完全実装仕様。
**この文書群の目的: どのAIモデル(Fable 5 / Opus 5 / その他)が実装しても、全く同じ完成物になること。**
実装者は裁量で設計判断をせず、本仕様に書かれた決定に従う。仕様に不足がある場合は
「07_DECISION_LOG.md に追記してから実装する」(黙って判断しない)。

## 文書構成と読む順序

| ファイル | 内容 |
|---|---|
| `01_ARCHITECTURE.md` | コーディング構成・技術決定・規約(全フェーズ共通の憲法) |
| `02_DATA_SPEC.md` | データ仕様。ヒーロー正準表(`data/heroes-canonical.json`)・slug移行表・命名規則・キュレーション規則 |
| `03_PHASE1_TRUST.md` | Phase 1: データ信頼性回復+基盤修正(タスク・変更ファイル・受け入れ基準) |
| `04_PHASE2_SEO_I18N.md` | Phase 2: URL再設計・セクションページ・i18n基盤・鮮度システム |
| `05_PHASE3_SAAS.md` | Phase 3: Supabase・AIコーチAPI・quota・課金・Dashboard |
| `06_VERIFICATION.md` | 各フェーズ共通の検証手順と完了条件 |
| `07_DECISION_LOG.md` | 実装中に発生した判断の記録(追記式) |

## 絶対条件(CEO指示 §52。違反は即修正対象)

1. 存在しないゲームデータを作らない(ヒーロー/スキル/アイテム/数値の推測記述禁止)
2. 出典のないゲームデータを「事実」として表示しない(編集部評価は必ずラベル+更新日)
3. AIの処理を偽装しない(実行していない分析を実行したように見せない)
4. モバイルをPCの縮小版として作らない
5. 機械翻訳の一括公開で多言語SEOを完成扱いしない
6. AI Coachを単なるチャットUIにしない
7. 大規模変更(DB/ページ構成/認証/課金/コーチarchitecture)は承諾済み範囲(Phase 1〜3)を超えない

## フェーズ実行順序(§40準拠)

各フェーズ内: 実装 → `npx tsc --noEmit` → `npm run lint` → `npm run build` →
ブラウザ検証(375/768/1440) → `06_VERIFICATION.md` のチェックリスト → PROGRESS.txt更新。
フェーズをまたぐ前に必ず全検証を通す。コミットはCEOの指示があった場合のみ。

## 前提知識

- このプロジェクトのNext.jsは16系。**コードを書く前に `node_modules/next/dist/docs/` の該当ガイドを読む**(AGENTS.md参照)。
- dev(Turbopack)は激遅。検証は `npm run build && npm run start -- -p 3002`。
- 監査報告書(スコア・根拠)は claude.ai/code/artifact/e305ecf8-fca8-4444-9180-5899ab9fb1ba。
