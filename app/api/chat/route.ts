import { NextResponse } from "next/server";
import { getHindsightBankId, getHindsightClient } from "@/lib/hindsight";

type ChatRequest = {
  message: string;
  mode?: "recall" | "reflect";
};

const FALLBACK_MEMORIES = [
  {
    type: "observation",
    text: "Marketing has an idle Midjourney seat (ID: MKT-99) unused for 22 days.",
  },
  {
    type: "observation",
    text: "An idle GPT-4 API key is assigned to the legacy Chatbot project.",
  },
] as const;

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ChatRequest>;
  const message = body.message?.trim();
  const mode = body.mode ?? "reflect";

  if (!message) {
    return NextResponse.json(
      { error: "Missing message" },
      { status: 400 }
    );
  }

  const bankId = getHindsightBankId();
  const client = getHindsightClient();

  // Keep a lightweight trail for later recall.
  try {
    await client.retain(bankId, `User: ${message}`);
  } catch {
    // If the provider is down, we still want the demo to proceed.
  }

  let memories: { type: string; text: string }[] = [];
  try {
    const recall = await client.recall(bankId, message, { budget: "mid" });
    memories = recall.results.slice(0, 6).map((m) => ({
      type: m.type,
      text: m.text,
    }));
  } catch {
    // Cloud outage / provider errors -> hardcoded fallback memories.
    memories = [...FALLBACK_MEMORIES];
  }

  if (mode === "recall") {
    return NextResponse.json({ mode, memories });
  }

  const context =
    memories.length > 0
      ? memories.map((m) => `- [${m.type}] ${m.text}`).join("\n")
      : "(no relevant memories found)";

  const reflected = await client.reflect(
    bankId,
    [
      "You are AI Resource Sentinel, a B2B SaaS assistant focused on AI spend governance.",
      "Use the recalled memories as context, and answer concisely with clear actions.",
      "If recalled memories exist, explicitly acknowledge them by starting your answer with: 'Based on my memory...'.",
      "",
      `User message: ${message}`,
      "",
      "Recalled memories:",
      context,
    ].join("\n")
  ).catch(() => {
    // If reflect fails too, return a deterministic demo response.
    const bullets =
      memories.length > 0
        ? memories
            .slice(0, 3)
            .map((m) => {
              if (m.text.toLowerCase().includes("midjourney")) {
                return "- Pause or reassign Midjourney seat `MKT-99` and confirm billing stops next cycle.";
              }
              if (m.text.toLowerCase().includes("gpt-4")) {
                return "- Rotate and disable the idle GPT-4 key; require tags + alerts before re-enabling.";
              }
              return `- Triage: ${m.text}`;
            })
            .join("\n")
        : "- No relevant memories found. Try asking about idle seats or API keys.";

    return { text: `Based on my memory, here’s what I found:\n${bullets}` };
  });

  const hasMemories = memories.length > 0;
  const responseText =
    hasMemories && !/^Based on my memory/i.test(reflected.text)
      ? `Based on my memory, ${reflected.text}`
      : reflected.text;

  try {
    await client.retain(bankId, `Sentinel: ${responseText}`);
  } catch {
    // ignore
  }

  return NextResponse.json({
    mode,
    response: responseText,
    memories,
  });
}

