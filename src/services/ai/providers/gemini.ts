import { BaseAIProvider } from "../baseProvider";
import { errorDetail, textOnly, toParts } from "../content";
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
    const systemMessage = messages.find((m) => m.role === "system");
    const system = systemMessage ? textOnly(systemMessage) : undefined;
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts:
          m.role === "assistant"
            ? [{ text: textOnly(m) }]
            : toParts(m.content).map((part) =>
                part.type === "text"
                  ? { text: part.text }
                  : { inlineData: { mimeType: part.mediaType, data: part.data } }
              ),
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
            maxOutputTokens: options?.maxTokens ?? 4096,
            ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
            // Gemini の responseSchema は OpenAPI 方言で共通スキーマと互換がないため、
            // jsonSchema 指定時も JSON 出力の指定にとどめ、形の検証は受け取った側で行う
            ...(options?.jsonMode || options?.jsonSchema ? { responseMimeType: "application/json" } : {}),
          },
        }),
      }
    );
    // URLにキーを含むため、エラー文にはURLを出さない
    if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await errorDetail(res)}`);
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
