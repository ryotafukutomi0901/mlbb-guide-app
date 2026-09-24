// AI層のリクエスト形式検証(docs/redesign/06_VERIFICATION.md)。
// 画像付きメッセージが各プロバイダのネイティブ形式で送られるか、既存の文字列呼び出しが
// 壊れていないかを確かめる。fetch を差し替えて送信内容だけを捕まえるので、
// APIキーも通信も不要(外部APIには一切送らない)。
// 実行: node scripts/qa/ai-wire.mjs
import path from "node:path";
import { createJiti } from "jiti";

const ROOT = path.resolve(import.meta.dirname, "../..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(ROOT, "src") } });

const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAfbLI3wAAAABJRU5ErkJggg==";
const messages = [
  { role: "system", content: "SYS" },
  { role: "user", content: [{ type: "text", text: "この試合を読んで" }, { type: "image", mediaType: "image/png", data: PNG }] },
];

let captured;
const reply = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
const OPENAI_LIKE = { model: "m", choices: [{ message: { content: "{}" } }], usage: { prompt_tokens: 10, completion_tokens: 2 } };
const CLAUDE_OK = { id: "msg_1", type: "message", role: "assistant", model: "claude-opus-5",
  content: [{ type: "thinking", thinking: "", signature: "x" }, { type: "text", text: "OK" }],
  stop_reason: "end_turn", stop_details: null, stop_sequence: null,
  usage: { input_tokens: 12, output_tokens: 3 } };
const GEMINI_OK = { candidates: [{ content: { parts: [{ text: "{}" }] } }], usageMetadata: { promptTokenCount: 9, candidatesTokenCount: 1 } };

let nextReply;
globalThis.fetch = async (url, init) => {
  const u = typeof url === "string" ? url : url.url;
  const headers = init?.headers instanceof Headers ? Object.fromEntries(init.headers) : { ...(init?.headers ?? {}) };
  captured = { url: u, body: JSON.parse(init.body), headers };
  return reply(nextReply);
};

process.env.OPENROUTER_API_KEY = "test"; process.env.OPENAI_API_KEY = "test";
process.env.ANTHROPIC_API_KEY = "test"; process.env.GEMINI_API_KEY = "test";

const { createAIProvider } = await jiti.import(path.join(ROOT, "src/services/ai/index.ts"));
const results = [];
const check = (name, cond, detail = "") => results.push({ name, ok: !!cond, detail });

// ── OpenRouter(実行経路) ──
nextReply = OPENAI_LIKE;
await createAIProvider("openrouter").complete(messages, { model: "anthropic/claude-sonnet-5", maxTokens: 100 });
{
  const user = captured.body.messages[1];
  check("openrouter: system は文字列", captured.body.messages[0].content === "SYS");
  check("openrouter: 画像が image_url(data URL)", user.content[1]?.type === "image_url" && user.content[1].image_url.url === `data:image/png;base64,${PNG}`);
  check("openrouter: テキスト部品が保持される", user.content[0]?.text === "この試合を読んで");
  check("openrouter: temperature 未指定なら送らない", !("temperature" in captured.body), JSON.stringify(Object.keys(captured.body)));
}

// ── 後方互換: 既存の文字列呼び出し ──
await createAIProvider("openrouter").complete([{ role: "user", content: "plain" }], { temperature: 0.4 });
check("互換: 文字列contentはそのまま文字列", captured.body.messages[0].content === "plain");
check("互換: temperature 指定時は送る", captured.body.temperature === 0.4);

// ── OpenAI ──
nextReply = OPENAI_LIKE;
await createAIProvider("openai").complete(messages);
check("openai: 画像が image_url", captured.body.messages[1].content[1]?.type === "image_url");

// ── Gemini ──
nextReply = GEMINI_OK;
await createAIProvider("gemini").complete(messages);
{
  const parts = captured.body.contents[0].parts;
  check("gemini: 画像が inlineData", parts[1]?.inlineData?.mimeType === "image/png" && parts[1].inlineData.data === PNG);
  check("gemini: system は systemInstruction", captured.body.systemInstruction?.parts[0]?.text === "SYS");
  check("gemini: temperature 未指定なら送らない", !("temperature" in captured.body.generationConfig));
}

// ── Claude(公式SDK) ──
nextReply = CLAUDE_OK;
const out = await createAIProvider("claude").complete(messages, { temperature: 0.3 });
{
  const img = captured.body.messages[0].content[1];
  check("claude: 画像が base64 image ブロック", img?.type === "image" && img.source?.type === "base64" && img.source.media_type === "image/png" && img.source.data === PNG);
  check("claude: system はトップレベル文字列", captured.body.system === "SYS");
  check("claude: 既定モデルは claude-opus-5", captured.body.model === "claude-opus-5");
  check("claude: 現行モデルに temperature を送らない", !("temperature" in captured.body));
  check("claude: fallbacks=default を付与", captured.body.fallbacks === "default");
  const beta = captured.headers["anthropic-beta"] ?? "";
  check("claude: fallback beta ヘッダ", beta.includes("server-side-fallback-2026-07-01"), beta);
  check("claude: 思考ブロックを除きテキストだけ返す", out.content === "OK", out.content);
  check("claude: usage を返す", out.usage?.inputTokens === 12 && out.usage?.outputTokens === 3);
}

// ── Claude: 拒否は例外にする ──
nextReply = { ...CLAUDE_OK, content: [], stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber", explanation: "" } };
let refused = false;
try { await createAIProvider("claude").complete([{ role: "user", content: "x" }]); } catch (e) { refused = e?.constructor?.name === "ClaudeRefusalError"; }
check("claude: refusal を ClaudeRefusalError にする", refused);

// ── 誤用の検出: system に画像 ──
let rejected = false;
try { await createAIProvider("openrouter").complete([{ role: "system", content: [{ type: "image", mediaType: "image/png", data: PNG }] }]); } catch { rejected = true; }
check("誤用: system の画像は黙って落とさず例外", rejected);

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.ok || !r.detail ? "" : `  (${r.detail})`}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
