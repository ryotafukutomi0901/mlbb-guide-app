import { BaseAIProvider } from "../baseProvider";
import { errorDetail, toOpenAIMessages } from "../content";
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
        messages: toOpenAIMessages(messages),
        max_tokens: options?.maxTokens ?? 4096,
        // anthropic/claude-sonnet-5 は temperature 非対応。指定されたときだけ送る
        ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
        ...(options?.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter API error: ${res.status} ${await errorDetail(res)}`);
    const data = await res.json();
    return {
      content: data.choices[0].message.content ?? "",
      model: data.model ?? model,
      usage: data.usage
        ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens }
        : undefined,
    };
  }
}
