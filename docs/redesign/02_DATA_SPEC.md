# 02. データ仕様(Game Knowledge Layer)

## 2-1. ヒーロー正準データ

**唯一の情報源: `docs/redesign/data/heroes-canonical.json`(全133体・検証済み)。**
`src/data/heroes.ts` の `HERO_ROSTER` はこのJSONの内容と1対1で一致させる(手書き転記でもスクリプト生成でも
よいが、乖離ゼロを `06` の検証スクリプトで確認する)。

- `ja` = 日本語クライアント公式表記(mljpwiki + wikiwiki + mobilelegends-sokuho の3ソース照合)。
  **表示は常に `ja`。** 従来のアプリ表記(ミヤ/ティグレアル等)は `aliases` に退避し検索でのみ使う。
- `verify: true` の2体(ミノタウロス/アイーダ)は表記裏取り継続対象。表示はするがDECISION_LOGに記録。
- 画像は `public/images/heroes/{En_Name}.png`(全133体存在確認済み)。
  変換規則: 半角スペース→`_`、`'`→削除(Chang'e→`Change.png`)。`HERO_IMAGES` は slug→この規則で全件再生成。
- Tier・difficulty は編集部評価。UI表示箇所には `DataBadge`(編集部評価 / 更新日)を付ける。

## 2-2. slug移行表(旧→新)

| 旧slug | 新slug | 備考 |
|---|---|---|
| `hylos2` | `hayabusa` | 隼 |
| `helcurt2` | **削除** | 捏造ヒーロー「ヘルムート」。データごと削除 |
| `belerick2` | `atlas` | アテラス |
| `atlas` | `barats` | バラッツ(belerick2の移行より**先に**実施) |
| `bennett` | `floryn` | フローラ |
| `auloz` | `fredrinn` | フレッドリン |
| `fredrinn2` | `chip` | チップ |
| `popolkupa` | `popol-and-kupa` | 正準規則統一 |
| `yisunshin` | `yi-sun-shin` | 正準規則統一 |

slugを参照する全ファイルを一括更新する:
`src/data/images.ts` / `meta.ts` / `hero-extras.ts` / `skins.ts` / `profile.ts` / `rankings.ts` /
`coach.ts` / `news.ts` / `patches.ts` / `events.ts` / `gacha.ts`。
検証: `grep -rn "hylos2\|helcurt2\|belerick2\|bennett\|auloz\|fredrinn2\|popolkupa\|yisunshin" src/` が0件。
旧URLはリダイレクト不要(未公開)。

## 2-3. Meta数値(勝率・ピック率・バン率)のキュレーション規則

1. `heroRepository.getHeroMeta` の**乱数フォールバックを削除**し、`HeroMeta | undefined` を返す。
2. 表示できるのは `src/data/meta.ts` の `CURATED_META` のみ。全エントリに
   `patch: string` と `updatedAt: string` を持たせ、`DataBadge` で「編集部評価 Patch {p}・{d}更新」を表示。
3. メタ未整備ヒーローのUI: 数値の代わりに「Tier {tier}(編集部評価)」のみ。ダッシュ表示や空白でよい。
   **乱数・推測値の表示は禁止。**
4. ホーム「今日のMETA」「勝率上昇中」/metaページ/HomeHero統計は CURATED_META のあるヒーローだけを母集団にする。

## 2-4. カウンター関係のキュレーション規則

1. `getMatchups` の `seededPick` フォールバックを**削除**。キュレーションのない ヒーローは
   `undefined` を返し、UIは「カウンターデータ準備中」を表示。
2. `hero-extras.ts` の型を理由付きへ拡張:
```ts
export interface CounterEdge {
  slug: string;                 // 相手ヒーロー
  reason: string;               // なぜ強い/弱いか(1〜2文・日本語)
  factors: CounterFactor[];     // "lane"|"burst"|"cc"|"mobility"|"sustain"|"range"|"scaling"|"pick"
}
```
   既存9体の `counters/counteredBy/synergies`(文字列slug配列)は CounterEdge[] へ移行し、
   reasonは既知のゲームメカニクスから記述できる範囲のみ書く(書けなければそのエントリは載せない)。
3. これはAIコーチのKnowledge Layerを兼ねる(05参照)。

## 2-5. スキル名(HERO_DETAILS 9体)の修正手順

現状のスキル名はほぼ全て創作(P0)。以下の手順で置換する:

1. 対象: alucard / tigreal / franco / layla / eudora / gusion / angela / estes / fanny
2. 一次ソース: `https://wikiwiki.jp/mobilelegend/Hero-{日本語名}`(例: Hero-アルカード、Hero-ゴセン、
   Hero-エスタス、Hero-ライラ)。二次: mljpwiki の該当ヒーローページ。
3. 日本語スキル名が確認できたもの → その表記を採用。
4. 確認できないもの → **英語公式スキル名をそのまま採用**(例: "Fission Wave")。カタカナ音写の創作は禁止。
5. スキル説明文は実際の効果と矛盾しない範囲で既存文を修正(効果が違う場合は書き直す)。
6. 修正結果と出典URLを `07_DECISION_LOG.md` に記録。

## 2-6. 装備(items.ts)

- 暫定カタカナ11件(マレフィックロア、アテナシールド、ヘプタシーズブレイド、レディアントアーマー、
  トワイライトアーマー、ウィッシングランタン、スカイピアサー、マレフィックガン、グレートドラゴンスピア、
  オアシスフラスコ、チャスティスポールドロン)は再照合し、日本語クライアント表記が確認できたら置換、
  できなければ**英語公式名をそのまま**使う(創作カタカナの継続は不可だが、既に流通している音写は
  aliasesとして保持してよい)。`Item` 型に `nameEn: string` と `aliases?: string[]` を追加(Phase 2のi18nで使用)。
- 性能数値・価格は現状データを維持(検証はパッチ追随タスクとして07に記録)。

## 2-7. 鮮度メタデータ(Phase 2)

攻略系データ(Tier/Meta/ビルド/カウンター/HERO_DETAILS)に共通フィールドを付与:
```ts
interface Freshness { patch: string; updatedAt: string; /* ISO日付 */ }
```
表示は `DataBadge`。sitemapの `lastModified` にも使う。現行パッチ定数は
`src/data/patches.ts` の先頭エントリから `getCurrentPatch()`(contentRepository)で取得する。
