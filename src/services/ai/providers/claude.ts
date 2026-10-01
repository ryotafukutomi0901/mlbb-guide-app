import Anthropic from "@anthropic-ai/sdk";
import { BaseAIProvider } from "../baseProvider";
import { textOnly, toParts } from "../content";
import type { AICompletionOptions, AICompletionResult, AIMessage } from "../types";

type BetaParams = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming;
type BetaMessageParam = Anthropic.Beta.Messages.BetaMessageParam;

/**
 * temperature を受け付ける旧世代モデル。
 * Opus 5 / Sonnet 5 / Fable 5 系などの現行モデルは送ると400になるため、許可リスト方式にする。
 */
const SAMPLING_MODELS = new Set(["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-6"]);

/**
 * サーバー側フォールバックを有効にするモデル。安全分類器が要求を拒否したとき、
 * 拒否の分類に応じた推奨モデルで同じ要求をAPI側が再実行する(`fallbacks: "default"`)。
 */
const FALLBACK_MODELS = new Set(["claude-opus-5", "claude-fable-5-1"]);

/** 拒否は正常応答(HTTP 200)で返るため、本文を読む前に判定して例外にする */
export class ClaudeRefusalError extends Error {}

function toClaudeMessage(message: AIMessage): BetaMessageParam {
  const role = message.role === "assistant" ? "assistant" : "user";
  if (role === "assistant" || typeof message.content === "string") {
    return { role, content: textOnly(message) };
  }
  return {
    role,
    content: toParts(message.content).map((part) =>
      part.type === "text"
        ? { type: "text", text: part.text }
        : { type: "image", source: { type: "base64", media_type: part.mediaType, data: part.data } }
    ),
  };
}

export class ClaudeProvider extends BaseAIProvider {
  readonly name = "Claude";
  protected readonly defaultModel = "claude-opus-5";

  protected get apiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  async complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult> {
    const client = new Anthropic({ apiKey: this.assertConfigured() });
    const model = options?.model ?? this.defaultModel;
    const systemMessage = messages.find((m) => m.role === "system");

    // jsonSchema は構造化出力で拘束する。スキーマのない jsonMode はプロンプト側で指示する
    const params: BetaParams = {
      model,
      max_tokens: options?.maxTokens ?? 16000,
      messages: messages.filter((m) => m.role !== "system").map(toClaudeMessage),
      ...(systemMessage ? { system: textOnly(systemMessage) } : {}),
      ...(options?.temperature !== undefined && SAMPLING_MODELS.has(model)
        ? { temperature: options.temperature }
        : {}),
      ...(options?.jsonSchema
        ? { output_config: { format: { type: "json_schema", schema: options.jsonSchema.schema } } }
        : {}),
      ...(FALLBACK_MODELS.has(model)
        ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
        : {}),
    };

    const response = await client.beta.messages.create(params);

    if (response.stop_reason === "refusal") {
      throw new ClaudeRefusalError(
        `Claudeが要求を拒否しました(${response.stop_details?.category ?? "分類なし"})`
      );
    }

    return {
      // 思考ブロック等を除き、テキストだけを連結する
      content: response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join(""),
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
