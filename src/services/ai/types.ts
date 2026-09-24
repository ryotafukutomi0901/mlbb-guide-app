import type { CoachReport } from "@/data/types";

/** 画像入力で受け付けるMIME(Anthropic・OpenAI・Gemini の共通部分) */
export type AIImageMediaType = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

export interface AITextPart {
  type: "text";
  text: string;
}

/** 画像は base64(data URL ではない)で持ち、各プロバイダが自分の形式に変換する */
export interface AIImagePart {
  type: "image";
  mediaType: AIImageMediaType;
  data: string;
}

export type AIContentPart = AITextPart | AIImagePart;

export interface AIMessage {
  role: "system" | "user" | "assistant";
  /** 文字列はテキスト1件として扱う。画像を渡すときは部品の配列にする(user のみ) */
  content: string | AIContentPart[];
}

export interface AICompletionOptions {
  model?: string;
  /** 指定したときだけ送る。現行のClaudeモデルなどは送ると400になるため既定値は持たない */
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AICompletionResult {
  content: string;
  /** 実際に応答したモデル(フォールバック時は要求したモデルと異なる) */
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface MatchAnalysisInput {
  matchId: string;
  heroSlug: string;
  kda: [number, number, number];
  gold: number;
  durationSeconds: number;
  timeline?: unknown;
}

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResult>;
  analyzeMatch(input: MatchAnalysisInput): Promise<CoachReport>;
}
