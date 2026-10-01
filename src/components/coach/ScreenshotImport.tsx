"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ImageUp, Loader2, Sparkles } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { QUOTA, describeReset } from "@/lib/coach/plans";
import type { ParsedMatchFields } from "@/lib/coach/vision";
import { cn } from "@/lib/utils";

export interface ScreenshotParseResponse {
  fields: ParsedMatchFields;
  /** 読み取れなかった、または範囲外で採用しなかった項目 */
  unreadable: (keyof ParsedMatchFields)[];
  /** 画面に書かれていたが、ヒーローを特定できなかった名前 */
  unresolvedHeroNames: string[];
  remaining: number;
}

export const PARSED_FIELD_LABEL: Record<keyof ParsedMatchFields, string> = {
  heroSlug: "使用ヒーロー",
  result: "試合結果",
  kills: "キル",
  deaths: "デス",
  assists: "アシスト",
  durationMinutes: "試合時間",
  gold: "ゴールド",
  allyHeroes: "味方ヒーロー",
  enemyHeroes: "敵ヒーロー",
};

/** 送る前に端末で縮小する。読み取りモデルは長辺1600px前後に縮めて読むため、それ以上は通信の無駄になる */
const MAX_EDGE = 1600;
const KEEP_ORIGINAL_UNDER_BYTES = 1.5 * 1024 * 1024;
const SERVER_TYPES = ["image/png", "image/jpeg", "image/webp"];

async function prepareImage(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // 画像として読めなければそのまま送り、形式の判定はサーバーに任せる
    return file;
  }
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= KEEP_ORIGINAL_UNDER_BYTES && SERVER_TYPES.includes(file.type)) {
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    return blob ?? file;
  } finally {
    bitmap.close();
  }
}

type Status =
  | { kind: "idle" }
  | { kind: "reading" }
  | { kind: "done"; result: ScreenshotParseResponse }
  | { kind: "error"; message: string; link?: { href: string; label: string } };

/** 失敗の理由ごとに、次に何をすればいいかを返す。どの場合も手入力で続けられることを伝える */
async function describeFailure(response: Response): Promise<Extract<Status, { kind: "error" }>> {
  const body = (await response.json().catch(() => ({}))) as { message?: string; resetAt?: string };
  switch (response.status) {
    case 401:
      return {
        kind: "error",
        message: "ログインの有効期限が切れました。もう一度ログインしてください。",
        link: { href: "/login", label: "ログイン" },
      };
    case 402: {
      const reset = describeReset(body.resetAt);
      return {
        kind: "error",
        message: `スクショ読み取りの回数を使い切りました。${reset ? `${reset}に回数が戻ります。` : ""}手入力で分析は続けられます。`,
        link: { href: "/pricing", label: "プランを見る" },
      };
    }
    default:
      return {
        kind: "error",
        message: body.message ?? "読み取りに失敗しました。手入力で分析を続けられます。",
      };
  }
}

/**
 * 試合結果のスクショからフォームを埋める欄。ログインしている人にだけ出す(Visionは原価が高いため登録者限定)。
 * 画像は読み取りのために送るだけで、保存しない。
 */
export function ScreenshotImport({ onParsed }: { onParsed: (result: ScreenshotParseResponse) => void }) {
  const auth = useAuthUser();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  // 判定前・障害中・アカウント機能なしでは何も出さない
  if (auth.status === "signedOut") {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-xs leading-relaxed text-text-muted">
        <ImageUp size={15} className="mt-0.5 shrink-0 text-primary" />
        <span>
          <Link href="/login" className="font-bold text-primary hover:text-neon">
            ログイン
          </Link>
          すると、試合結果のスクショからKDAや試合時間を自動入力できます(無料で月
          {QUOTA.free.screenshot_parse.perMonth}回)。
        </span>
      </p>
    );
  }
  if (auth.status !== "signedIn") return null;

  async function read(file: File) {
    setStatus({ kind: "reading" });
    setPreview(URL.createObjectURL(file));
    try {
      const form = new FormData();
      form.append("image", await prepareImage(file), file.name || "screenshot");
      const response = await fetch("/api/coach/parse-screenshot", { method: "POST", body: form });
      if (!response.ok) {
        setStatus(await describeFailure(response));
        return;
      }
      const result = (await response.json()) as ScreenshotParseResponse;
      onParsed(result);
      setStatus({ kind: "done", result });
    } catch {
      setStatus({ kind: "error", message: "通信に失敗しました。接続を確認してもう一度お試しください。" });
    }
  }

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file) void read(file);
  }

  const reading = status.kind === "reading";

  return (
    <div className="flex flex-col gap-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!reading) pick(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3 py-3 transition-colors focus-within:ring-2 focus-within:ring-primary/60",
          dragging ? "border-primary bg-primary/10" : "border-primary/40 bg-primary/5 hover:bg-primary/10",
          reading && "pointer-events-none opacity-70"
        )}
      >
        {/* 入力は見えなくしてラベル全体を押せる範囲にする。キーボード操作時はラベルに枠を出す */}
        <input
          id="screenshot"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={reading}
          onChange={(e) => {
            pick(e.target.files);
            // 同じ画像を選び直しても読み取れるようにする
            e.target.value = "";
          }}
          className="sr-only"
        />
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
          {reading ? <Loader2 size={18} className="animate-spin" /> : <ImageUp size={18} />}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold">
            {reading ? "スクショを読み取っています…" : "試合結果のスクショから入力する"}
          </span>
          <span className="block text-xs leading-relaxed text-text-muted">
            試合後の結果画面を選ぶと、下の欄に値を入れます。送信前に確認・修正できます。画像は保存しません。
          </span>
        </span>
      </label>

      <div aria-live="polite">
        {status.kind === "done" && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-xs leading-relaxed">
            <p className="flex items-center gap-1.5 font-bold text-primary">
              <Sparkles size={13} />
              AIが読み取った値を入力しました。送信前にスクショと見比べてください。
            </p>
            {status.result.unreadable.length > 0 && (
              <p className="mt-1 text-text-muted">
                読み取れなかった項目:{" "}
                {status.result.unreadable.map((key) => PARSED_FIELD_LABEL[key]).join("・")}
              </p>
            )}
            {status.result.unresolvedHeroNames.length > 0 && (
              <p className="mt-1 text-text-muted">
                特定できなかったヒーロー名: {status.result.unresolvedHeroNames.join("・")}
              </p>
            )}
            <p className="mt-1 text-text-faint">スクショ読み取りの残り {status.result.remaining}回</p>
          </div>
        )}
        {status.kind === "error" && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-xs leading-relaxed text-text"
          >
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-gold" />
            <span>
              {status.message}
              {status.link && (
                <>
                  {" "}
                  <Link href={status.link.href} className="font-bold text-primary hover:text-neon">
                    {status.link.label}
                  </Link>
                </>
              )}
            </span>
          </p>
        )}
      </div>

      {preview && status.kind !== "reading" && (
        <details className="group rounded-xl border border-border bg-surface/60 text-xs">
          <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- 端末内の一時URL(blob:)のため next/image は使えない */}
            <img src={preview} alt="" className="h-8 w-14 rounded object-cover" />
            <span className="group-open:hidden">選んだスクショを表示</span>
            <span className="hidden group-open:inline">閉じる</span>
          </summary>
          {/* eslint-disable-next-line @next/next/no-img-element -- 同上 */}
          <img src={preview} alt="選んだ試合結果のスクショ" className="w-full rounded-b-xl" />
        </details>
      )}
    </div>
  );
}
