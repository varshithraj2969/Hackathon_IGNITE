import { HindsightClient } from "@vectorize-io/hindsight-client";

type RecallResult = { text: string; type?: string | null };
type RecallResponse = { results: RecallResult[] };
type ReflectResponse = { text: string };

type HindsightLikeClient = {
  retain(bankId: string, content: string, options?: unknown): Promise<unknown>;
  recall(bankId: string, query: string, options?: unknown): Promise<RecallResponse>;
  reflect(bankId: string, prompt: string, options?: unknown): Promise<ReflectResponse>;
};

const DEMO_MEMORIES: RecallResult[] = [
  {
    type: "observation",
    text: "Marketing has an idle Midjourney seat (ID: MKT-99) unused for 22 days.",
  },
  {
    type: "experience",
    text: "The GPT-4 API key for the dev-test project is active but has 0 usage.",
  },
  {
    type: "observation",
    text: "Design team has a spare Figma seat.",
  },
];

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function score(query: string, text: string): number {
  const q = new Set(tokenize(query));
  if (q.size === 0) return 0;
  const t = tokenize(text);
  let hits = 0;
  for (const tok of t) if (q.has(tok)) hits++;
  return hits / Math.max(6, t.length);
}

class MockHindsightClient implements HindsightLikeClient {
  private memoriesByBank = new Map<string, RecallResult[]>();
  private auditTrailByBank = new Map<string, string[]>();

  constructor() {
    this.memoriesByBank.set("ai-resource-sentinel", [...DEMO_MEMORIES]);
  }

  async retain(bankId: string, content: string) {
    const existing = this.auditTrailByBank.get(bankId) ?? [];
    existing.push(content);
    this.auditTrailByBank.set(bankId, existing);
    return { ok: true };
  }

  async recall(bankId: string, query: string, _options?: unknown): Promise<RecallResponse> {
    const base = this.memoriesByBank.get(bankId) ?? [...DEMO_MEMORIES];
    const ranked = base
      .map((m) => ({ m, s: score(query, m.text) }))
      .sort((a, b) => b.s - a.s)
      .filter((x) => x.s > 0);

    // If the query looks like an "idle/waste" request, return all demo items to
    // guarantee a strong "remembering" moment in the demo.
    const q = query.toLowerCase();
    const looksLikeWaste =
      q.includes("idle") ||
      q.includes("waste") ||
      q.includes("zombie") ||
      q.includes("unused") ||
      q.includes("0 usage") ||
      q.includes("zero usage") ||
      q.includes("seat") ||
      q.includes("key") ||
      q.includes("license");

    const results = looksLikeWaste
      ? base.slice(0, 6)
      : ranked.slice(0, 6).map((x) => x.m);

    return { results };
  }

  async reflect(bankId: string, prompt: string): Promise<ReflectResponse> {
    // A tiny deterministic "assistant" for demo videos:
    // - If prompt contains recalled memories, we output actionable bullets.
    // - Keep it short and SaaS-y.
    const bankMemories = this.memoriesByBank.get(bankId) ?? DEMO_MEMORIES;
    const mentioned = bankMemories.filter((m) =>
      prompt.toLowerCase().includes(m.text.toLowerCase().slice(0, 24))
    );

    const actionable =
      mentioned.length > 0
        ? mentioned
            .map((m) => {
              if (m.text.includes("Midjourney")) {
                return "Pause or reassign Midjourney seat `MKT-99`, then confirm billing stops next cycle.";
              }
              if (m.text.includes("GPT-4 API key")) {
                return "Rotate and disable the dev-test GPT-4 key; add an allowlist + usage alert before re-enabling.";
              }
              if (m.text.includes("Figma")) {
                return "Reclaim the spare Figma seat and update offboarding automation to revoke licenses immediately.";
              }
              return `Triage: ${m.text}`;
            })
            .join("\n")
        : "No strong memory match. Ask me to Recall idle seats, keys, or licenses.";

    const text = `Here’s what I recommend:\n${actionable}`;
    return { text };
  }
}

let client: HindsightLikeClient | null = null;

export function getHindsightClient(): HindsightLikeClient {
  if (client) return client;
  const baseUrl =
    process.env.HINDSIGHT_BASE_URL ?? "https://api.hindsight.vectorize.io";
  const apiKey = process.env.HINDSIGHT_API_KEY;

  // For hackathon/demo reliability: automatically fall back to a mock client when
  // no credentials are present or when explicitly enabled.
  const forceMock =
    process.env.HINDSIGHT_MOCK === "1" || process.env.HINDSIGHT_MOCK === "true";

  if (forceMock || !apiKey) {
    client = new MockHindsightClient();
    return client;
  }

  client = new HindsightClient({ baseUrl, apiKey });
  return client;
}

export function getHindsightBankId(): string {
  return process.env.HINDSIGHT_BANK_ID ?? "ai-resource-sentinel";
}

export function isMockHindsightEnabled(): boolean {
  return client instanceof MockHindsightClient;
}

