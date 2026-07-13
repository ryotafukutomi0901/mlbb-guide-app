import { ANALYSIS_PROMPT } from "@/prompts/analysisPrompt";
import { SYSTEM_PROMPT } from "@/prompts/systemPrompt";
import type { CoachReport } from "@/data/types";
import type {
  AICompletionOptions,
  AICompletionResult,
  AIMessage,
  AIProvider,
  MatchAnalysisInput,
} from "./types";

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: string;
  protected abstract readonly defaultModel: string;

  protected abstract get apiKey(): string | undefined;

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  abstract complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult>;

  protected assertConfigured(): string {
    const key = this.apiKey;
    if (!key) {
      throw new Error(
        `${this.name} のAPIキーが設定されていません。.envを確認してください。`
      );
    }
    return key;
  }

  async analyzeMatch(input: MatchAnalysisInput): Promise<CoachReport> {
    const result = await this.complete(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${ANALYSIS_PROMPT}\n\n試合データ:\n${JSON.stringify(input)}` },
      ],
      { jsonMode: true }
    );
    return JSON.parse(result.content) as CoachReport;
  }
}
