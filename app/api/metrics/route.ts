import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Metrics = {
  totalMonthlySpend: number;
  lastActivityAt: string | null;
  lastActivitySummary: string | null;
};

function metricsPath() {
  return path.join(process.cwd(), "data", "metrics.json");
}

async function readMetrics(): Promise<Metrics> {
  try {
    const raw = await readFile(metricsPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<Metrics>;
    return {
      totalMonthlySpend:
        typeof parsed.totalMonthlySpend === "number" ? parsed.totalMonthlySpend : 48920,
      lastActivityAt: parsed.lastActivityAt ?? null,
      lastActivitySummary: parsed.lastActivitySummary ?? null,
    };
  } catch {
    return {
      totalMonthlySpend: 48920,
      lastActivityAt: null,
      lastActivitySummary: null,
    };
  }
}

async function writeMetrics(m: Metrics) {
  await mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await writeFile(metricsPath(), JSON.stringify(m, null, 2), "utf8");
}

export async function GET() {
  const metrics = await readMetrics();
  // Ensure file exists after first read in dev.
  await writeMetrics(metrics);
  return NextResponse.json(metrics);
}

