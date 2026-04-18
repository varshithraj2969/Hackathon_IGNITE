import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getHindsightBankId, getHindsightClient } from "@/lib/hindsight";

type KeyRecord = {
  id: string;
  toolName: string;
  apiKey: string;
  assignedTeam: string;
  createdAt: string;
  lastUsedAt?: string | null;
};

type Metrics = {
  totalMonthlySpend: number;
  lastActivityAt: string | null;
  lastActivitySummary: string | null;
};

type UsageEvent = {
  id: string;
  toolName: string;
  team: string;
  cost: number;
  occurredAt: string;
  source: "tracked";
};

function keysPath() {
  return path.join(process.cwd(), "data", "keys.json");
}

function metricsPath() {
  return path.join(process.cwd(), "data", "metrics.json");
}

function usagePath() {
  return path.join(process.cwd(), "data", "usage.json");
}

function getBearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  return h.slice(7).trim() || null;
}

async function readKeys(): Promise<KeyRecord[]> {
  try {
    const raw = await readFile(keysPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as KeyRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeKeys(items: KeyRecord[]) {
  await mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await writeFile(keysPath(), JSON.stringify(items, null, 2), "utf8");
}

async function readMetrics(): Promise<Metrics> {
  try {
    const raw = await readFile(metricsPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<Metrics>;
    return {
      totalMonthlySpend:
        typeof parsed.totalMonthlySpend === "number"
          ? parsed.totalMonthlySpend
          : 48920,
      lastActivityAt: parsed.lastActivityAt ?? null,
      lastActivitySummary: parsed.lastActivitySummary ?? null,
    };
  } catch {
    return { totalMonthlySpend: 48920, lastActivityAt: null, lastActivitySummary: null };
  }
}

async function writeMetrics(m: Metrics) {
  await mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await writeFile(metricsPath(), JSON.stringify(m, null, 2), "utf8");
}

async function readUsage(): Promise<UsageEvent[]> {
  try {
    const raw = await readFile(usagePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as UsageEvent[]) : [];
  } catch {
    return [];
  }
}

async function writeUsage(items: UsageEvent[]) {
  await mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await writeFile(usagePath(), JSON.stringify(items, null, 2), "utf8");
}

/**
 * Real-world tracking endpoint.
 *
 * Your friend (or any machine) calls this endpoint using the SAME API key
 * you stored in Settings → Keys as the Bearer token:
 *
 * Authorization: Bearer <THE_STORED_API_KEY>
 *
 * Optional JSON body: { "cost": 0.5 }
 *
 * Server will:
 * - lookup the key in data/keys.json
 * - log usage, update metrics, and retain a Hindsight memory
 */
export async function POST(req: Request) {
  const incomingKey = getBearer(req);
  if (!incomingKey) {
    return NextResponse.json(
      { error: "Missing Authorization: Bearer <apiKey>" },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { cost?: number };
  const cost =
    typeof body.cost === "number" && Number.isFinite(body.cost) && body.cost >= 0
      ? Math.round(body.cost * 100) / 100
      : 0.5;

  const keys = await readKeys();
  const matchIdx = keys.findIndex((k) => k.apiKey === incomingKey);
  if (matchIdx === -1) {
    return NextResponse.json(
      { error: "API key not registered in dashboard (Settings → Keys)" },
      { status: 404 }
    );
  }

  const matched = keys[matchIdx];
  const now = new Date().toISOString();
  const summary = `${matched.toolName} was used just now by ${matched.assignedTeam}. Cost: $${cost.toFixed(
    2
  )}.`;

  // Update key last-used timestamp (for governance / idle detection).
  keys[matchIdx] = { ...matched, lastUsedAt: now };
  await writeKeys(keys);

  // Best-effort Hindsight retain.
  try {
    const client = getHindsightClient();
    const bankId = getHindsightBankId();
    await client.retain(bankId, summary);
  } catch {
    // ignore outage/mock mode
  }

  const metrics = await readMetrics();
  const updated: Metrics = {
    totalMonthlySpend: Math.round((metrics.totalMonthlySpend + cost) * 100) / 100,
    lastActivityAt: now,
    lastActivitySummary: summary,
  };
  await writeMetrics(updated);

  const usage = await readUsage();
  usage.unshift({
    id: crypto.randomUUID(),
    toolName: matched.toolName,
    team: matched.assignedTeam,
    cost,
    occurredAt: now,
    source: "tracked",
  });
  await writeUsage(usage.slice(0, 500));

  return NextResponse.json({ ok: true, summary, metrics: updated });
}

