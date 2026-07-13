import type { CoachReport } from "@/data/types";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AICompletionResult {
  content: string;
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
