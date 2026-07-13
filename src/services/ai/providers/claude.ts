import { BaseAIProvider } from "../baseProvider";
import type { AICompletionOptions, AICompletionResult, AIMessage } from "../types";

export class ClaudeProvider extends BaseAIProvider {
  readonly name = "Claude";
  protected readonly defaultModel = "claude-sonnet-5";

  protected get apiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  async complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult> {
    const key = this.assertConfigured();
    const model = options?.model ?? this.defaultModel;
    const system = messages.find((m) => m.role === "system")?.content;
    const chat = messages.filter((m) => m.role !== "system");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.3,
        ...(system ? { system } : {}),
        messages: chat,
      }),
    });
    if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
    const data = await res.json();
    return {
      content: data.content[0].text,
      model,
      usage: data.usage
        ? { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens }
        : undefined,
    };
  }
}
