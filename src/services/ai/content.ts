import type { AIContentPart, AIMessage } from "./types";

/** 文字列でも配列でも部品の配列に揃える */
export function toParts(content: AIMessage["content"]): AIContentPart[] {
  return typeof content === "string" ? [{ type: "text", text: content }] : content;
}

/**
 * system / assistant のようにテキストしか置けない場所の本文を取り出す。
 * 画像が混ざっていたら呼び出し側の誤りなので、黙って落とさずに止める。
 */
export function textOnly(message: AIMessage): string {
  if (typeof message.content === "string") return message.content;
  if (message.content.some((part) => part.type === "image")) {
    throw new Error(`${message.role} メッセージには画像を含められません`);
  }
  return message.content.map((part) => (part.type === "text" ? part.text : "")).join("\n");
}

/** OpenAI互換API(OpenAI・OpenRouter)のメッセージ形式へ変換する */
export function toOpenAIMessages(messages: AIMessage[]) {
  return messages.map((message) => {
    if (message.role !== "user" || typeof message.content === "string") {
      return { role: message.role, content: textOnly(message) };
    }
    return {
      role: message.role,
      content: message.content.map((part) =>
        part.type === "text"
          ? { type: "text" as const, text: part.text }
          : {
              type: "image_url" as const,
              image_url: { url: `data:${part.mediaType};base64,${part.data}` },
            }
      ),
    };
  });
}

/** エラー応答の本文を短く添える(原因の切り分け用。キーは含まれない) */
export async function errorDetail(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "";
  }
}
