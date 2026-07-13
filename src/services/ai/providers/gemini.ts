import { BaseAIProvider } from "../baseProvider";
import type { AICompletionOptions, AICompletionResult, AIMessage } from "../types";

export class GeminiProvider extends BaseAIProvider {
  readonly name = "Gemini";
  protected readonly defaultModel = "gemini-2.5-pro";

  protected get apiKey(): string | undefined {
    return process.env.GEMINI_API_KEY;
  }

  async complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult> {
    const key = this.assertConfigured();
    const model = options?.model ?? this.defaultModel;
    const system = messages.find((m) => m.role === "system")?.content;
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          contents,
          generationConfig: {
            temperature: options?.temperature ?? 0.3,
            maxOutputTokens: options?.maxTokens ?? 4096,
            ...(options?.jsonMode ? { responseMimeType: "application/json" } : {}),
          },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      model,
      usage: data.usageMetadata
        ? {
            inputTokens: data.usageMetadata.promptTokenCount,
            outputTokens: data.usageMetadata.candidatesTokenCount,
          }
        : undefined,
    };
  }
}
