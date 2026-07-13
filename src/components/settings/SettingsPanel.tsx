"use client";

import { useState } from "react";
import { Database, Eye, Globe, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppState } from "@/providers/AppStateProvider";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border/60 bg-surface-2/40 p-4 text-left transition-colors hover:border-border-bright"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs text-text-muted">{description}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-primary/60 bg-primary/80" : "border-border bg-surface-2"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all duration-300",
            checked ? "left-[calc(100%-1.25rem)]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

export function SettingsPanel() {
  const { settings, updateSettings, favorites, recentHeroes } = useAppState();
  const [cleared, setCleared] = useState(false);

  function clearLocalData() {
    try {
      window.localStorage.removeItem("mlbb:favorites");
      window.localStorage.removeItem("mlbb:recent-heroes");
      window.sessionStorage.removeItem("mlbb:splash-seen");
      setCleared(true);
      window.setTimeout(() => window.location.reload(), 600);
    } catch {
      // ストレージ不可の環境では何もしない
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <h2 className="mb-3 text-sm font-bold">表示</h2>
        <div className="flex flex-col gap-2">
          <Toggle
            checked={settings.reduceMotion}
            onChange={(v) => updateSettings({ reduceMotion: v })}
            label="演出を軽減する"
            description="アニメーションやエフェクトを最小限にします(次回読み込みから適用)。"
            icon={<Wand2 size={17} />}
          />
          <Toggle
            checked={settings.showSpoilers}
            onChange={(v) => updateSettings({ showSpoilers: v })}
            label="未リリース情報を表示"
            description="リーク・先行情報を含むニュースを表示します。"
            icon={<Eye size={17} />}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold">地域</h2>
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2/40 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neon/30 bg-neon/10 text-neon">
            <Globe size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">サーバー地域</p>
            <p className="mt-0.5 text-xs text-text-muted">ランキング・統計の参照地域</p>
          </div>
          <select
            value={settings.region}
            onChange={(e) => updateSettings({ region: e.target.value })}
            aria-label="サーバー地域"
            className="cursor-pointer rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium outline-none focus:border-primary/60"
          >
            <option value="JP">日本</option>
            <option value="SEA">東南アジア</option>
            <option value="NA">北米</option>
            <option value="EU">ヨーロッパ</option>
          </select>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold">データ</h2>
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2/40 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
            <Database size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">ローカルデータの初期化</p>
            <p className="mt-0.5 text-xs text-text-muted">
              お気に入り{favorites.length}件・閲覧履歴{recentHeroes.length}件を削除します。
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={clearLocalData} disabled={cleared}>
            <Trash2 size={13} />
            {cleared ? "削除しました" : "初期化"}
          </Button>
        </div>
      </Card>

      <p className="text-center text-[10px] leading-relaxed text-text-faint">
        MLBB LABは非公式のファンサイトです。Mobile Legends: Bang Bangおよび関連アセットはMoonton社に帰属します。
      </p>
    </div>
  );
}
