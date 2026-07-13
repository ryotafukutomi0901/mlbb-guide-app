import { BaseAIProvider } from "../baseProvider";
import type { AICompletionOptions, AICompletionResult, AIMessage } from "../types";

export class OpenRouterProvider extends BaseAIProvider {
  readonly name = "OpenRouter";
  protected readonly defaultModel = "anthropic/claude-sonnet-5";

  protected get apiKey(): string | undefined {
    return process.env.OPENROUTER_API_KEY;
  }

  async complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult> {
    const key = this.assertConfigured();
    const model = options?.model ?? this.defaultModel;
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 4096,
        ...(options?.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
    const data = await res.json();
    return {
      content: data.choices[0].message.content,
      model,
      usage: data.usage
        ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens }
        : undefined,
    };
  }
}
