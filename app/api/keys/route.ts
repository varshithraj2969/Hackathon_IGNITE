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

function dataPath() {
  return path.join(process.cwd(), "data", "keys.json");
}

async function readDb(): Promise<KeyRecord[]> {
  try {
    const raw = await readFile(dataPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as KeyRecord[];
  } catch {
    return [];
  }
}

async function writeDb(items: KeyRecord[]) {
  await mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await writeFile(dataPath(), JSON.stringify(items, null, 2), "utf8");
}

export async function GET() {
  const items = await readDb();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<KeyRecord>;
  const toolName = body.toolName?.trim();
  const apiKey = body.apiKey?.trim();
  const assignedTeam = body.assignedTeam?.trim();

  if (!toolName || !apiKey || !assignedTeam) {
    return NextResponse.json(
      { error: "Missing toolName, apiKey, or assignedTeam" },
      { status: 400 }
    );
  }

  const items = await readDb();
  const record: KeyRecord = {
    id: crypto.randomUUID(),
    toolName,
    apiKey,
    assignedTeam,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
  items.unshift(record);
  await writeDb(items);

  // Side effect: retain an audit memory (best-effort for demo reliability).
  try {
    const client = getHindsightClient();
    const bankId = getHindsightBankId();
    await client.retain(
      bankId,
      `New asset ${toolName} added for ${assignedTeam}. Status: Active.`
    );
  } catch {
    // ignore provider outages / mock mode
  }

  return NextResponse.json({ item: record }, { status: 201 });
}

