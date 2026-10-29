import { getFirebaseStorageBucket, getFirestoreDB } from "@/lib/server/server.firebaseInterface";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LLAMA_URL = process.env.LLAMA_URL!;
const LLAMA_API_KEY = process.env.LLAMA_API_KEY!;
const LLAMA_MODEL = process.env.LLAMA_MODEL!;

type Blog = { id: string; title: string; description: string };
type InMsg = { role?: string; content?: string; message?: string };

let blogCache: Blog[] | null = null;
let blogCacheAt = 0;
const BLOG_TTL = 1 * 60 * 1000;

async function getBlogs(): Promise<Blog[]> {
  if (blogCache && Date.now() - blogCacheAt < BLOG_TTL &&  process.env.NODE_ENV == "production") return blogCache;

  const db = getFirestoreDB();
  const bucket = getFirebaseStorageBucket();
  const snap = await db.collection("public-blog-index").get();

  const results = await Promise.all(
    snap.docs.map(async (doc): Promise<Blog | null> => {
      try {
        const [buf] = await bucket
          .file(`blog_page/${doc.id}/metadata.json`)
          .download();
        const meta = JSON.parse(buf.toString("utf-8"));
        return {
          id: doc.id,
          title: String(meta.title ?? ""),
          description: String(meta.description ?? ""),
        };
      } catch (e) {
        console.error("metadata failed for", doc.id, e);
        return null;
      }
    })
  );

  blogCache = results.filter((b): b is Blog => b !== null);
  blogCacheAt = Date.now();
  return blogCache;
}

let promptCache: string | null = null;
let promptCacheAt = 0;
const PROMPT_TTL = 1 * 60 * 1000;

async function getSystemPrompt(): Promise<string | null> {
  try {
    if (!promptCache || Date.now() - promptCacheAt >= PROMPT_TTL ||  process.env.NODE_ENV !== "production") {
      const snap = await getFirestoreDB().collection("solas").doc("prompt").get();
      const text = snap.data()?.system;
      if (typeof text !== "string" || !text.trim()) {
        throw new Error("system prompt missing");
      }
      promptCache = text.trimEnd();
      promptCacheAt = Date.now();
    }

    const blogs = await getBlogs();
    return (
      promptCache +
      "\n" +
      blogs.map((b) => `/blog/${b.id} [${b.title}] [${b.description}]`).join("\n")
    );
  } catch (e) {
    console.error("system prompt failed:", e);
    return null;
  }
}

let fallbackCache: string[] | null = null;
let fallbackCacheAt = 0;
const FALLBACK_TTL = 1 * 60 * 1000;

async function getFallback(): Promise<string | null> {
  try {
    if (!fallbackCache || Date.now() - fallbackCacheAt >= FALLBACK_TTL ||  process.env.NODE_ENV !== "production") {
      const f = (await getFirestoreDB().collection("solas").doc("prompt").get()).data()?.fallback_response;
      fallbackCache = (Array.isArray(f) ? f : [f]).filter(
        (s): s is string => typeof s === "string" && s.trim() !== ""
      );
      fallbackCacheAt = Date.now();
    }
    if (!fallbackCache.length) return null;
    return fallbackCache[Math.floor(Math.random() * fallbackCache.length)];
  } catch (e) {
    console.error("fallback failed:", e);
    return null;
  }
}

const tools = [
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Open a page on the website for the user.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Either / or /blog or /blog/<id>" },
        },
        required: ["path"],
      },
    },
  },
];

export async function POST(req: Request) {
  const body = await req.json();
  const raw: InMsg[] = Array.isArray(body?.messages)
    ? body.messages
    : typeof body?.message === "string"
      ? [{ message: body.message }]
      : [];

  const userMsgs = raw
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? m.message ?? "").slice(0, 1000),
    }))
    .filter((m) => m.content)
    .slice(-2); // last assistant reply + current user input
  if (userMsgs.length === 0) return new Response("No message content", { status: 400 });

  const blogs = await getBlogs();
  const system = await getSystemPrompt();
  if (!system) return new Response(`Internal server error`, { status: 500 });

  const promptRef = getFirestoreDB().collection("solas").doc("prompt");
  const COOLDOWN_MS = 5000; // change as needed
  try {
    const v = (await promptRef.get()).data()?.last_query;
    const ms =
      v == null ? 0
        : typeof v?.toMillis === "function" ? v.toMillis()
          : typeof v === "number" ? v
            : Date.parse(v);
    if (!Number.isFinite(ms) || ms >= Date.now()) {
      const text = await getFallback();
      if (text) {
        return new Response(JSON.stringify({ type: "text", text }) + "\n", {
          headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
        });
      }
      return new Response("Too many requests", { status: 429 });
    }
    await promptRef.update({ last_query: Date.now() + COOLDOWN_MS });
  } catch (e) {
    console.error("last_query check failed:", e);
    return new Response("Internal server error", { status: 500 });
  }
  console.log(system, userMsgs);
  const upstream = await fetch(`${LLAMA_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLAMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLAMA_MODEL,
      messages: [{ role: "system", content: system }, ...userMsgs],
      tools,
      tool_choice: "auto",
      stream: true,
      max_tokens: 100,
      chat_template_kwargs: { enable_thinking: false },
      reasoning: { enabled: false },
    }),
    signal: req.signal,
    redirect: "manual",
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    console.error("llama error:", upstream.status, text);
    return new Response(`Upstream error`, { status: 502 });
  }

  const allowed = new Set(["/", "/blog", ...blogs.map((b) => `/blog/${b.id}`)]);
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  const emit = (c: ReadableStreamDefaultController, o: object) =>
    c.enqueue(encoder.encode(JSON.stringify(o) + "\n"));

  let buffer = "";
  const calls: Record<number, { name: string; args: string }> = {};

  // returns text found in this SSE line, collects tool calls as a side effect
  const handleLine = (line: string): string => {
    const t = line.trim();
    if (!t.startsWith("data:")) return "";
    const data = t.slice(5).trim();
    if (!data || data === "[DONE]") return "";
    try {
      const delta = JSON.parse(data).choices?.[0]?.delta;
      for (const tc of delta?.tool_calls ?? []) {
        const i = tc.index ?? 0;
        calls[i] ??= { name: "", args: "" };
        if (tc.function?.name) calls[i].name += tc.function.name;
        if (tc.function?.arguments) calls[i].args += tc.function.arguments;
      }
      return delta?.content ?? "";
    } catch {
      return "";
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let text = "";
          for (const line of lines) text += handleLine(line);
          if (text) emit(controller, { type: "text", text });
        }

        if (buffer) {
          const text = handleLine(buffer);
          if (text) emit(controller, { type: "text", text });
        }

        for (const c of Object.values(calls)) {
          if (c.name !== "navigate") continue;
          try {
            const path = JSON.parse(c.args).path;
            if (allowed.has(path)) {
              emit(controller, { type: "navigate", path });
            } else {
              console.warn("navigate path not allowed:", path);
            }
          } catch {
            console.warn("navigate args unparsable:", c.args);
          }
        }
        promptRef.update({ last_query: 0 }).catch(() => {});
        controller.close();
      } catch {
        try { controller.error(new Error("stream failed")); } catch { }
      }
    },
    cancel() {
      reader.cancel();
      promptRef.update({ last_query: 0 }).catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}