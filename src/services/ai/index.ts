import { ClaudeProvider } from "./providers/claude";
import { GeminiProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";
import { OpenRouterProvider } from "./providers/openrouter";
import type { AIProvider } from "./types";

export type AIProviderName = "openai" | "claude" | "gemini" | "openrouter";

const providers: Record<AIProviderName, () => AIProvider> = {
  openai: () => new OpenAIProvider(),
  claude: () => new ClaudeProvider(),
  gemini: () => new GeminiProvider(),
  openrouter: () => new OpenRouterProvider(),
};

export const DEFAULT_PROVIDER: AIProviderName = "openrouter";

export function createAIProvider(name: AIProviderName = DEFAULT_PROVIDER): AIProvider {
  return providers[name]();
}

export type { AIProvider, AIMessage, AICompletionOptions, AICompletionResult } from "./types";
