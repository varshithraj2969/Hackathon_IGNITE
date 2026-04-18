"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import { SentinelFeed } from "../components/SentinelFeed";
import { Sidebar } from "../components/Sidebar";
import { TopCards } from "../components/TopCards";
import { MobileNav } from "../components/MobileNav";
import {
  Bell,
  CircleHelp,
  Filter,
  KeyRound,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";

type AssetRow = {
  asset: string;
  owner: string;
  activity: string;
  risk: "Low" | "Waste";
  cost: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ASSETS: AssetRow[] = [
  {
    asset: "OpenAI API Key · gpt-prod-07",
    owner: "Platform Team",
    activity: "Active",
    risk: "Low",
    cost: "$9,140/mo",
    icon: KeyRound,
  },
  {
    asset: "Anthropic Seat Pool · growth",
    owner: "Growth Ops",
    activity: "Idle 34d",
    risk: "Waste",
    cost: "$2,800/mo",
    icon: Users,
  },
  {
    asset: "Vector DB Embeddings · legacy-index",
    owner: "Search",
    activity: "Idle 21d",
    risk: "Waste",
    cost: "$1,060/mo",
    icon: ShieldAlert,
  },
  {
    asset: "Midjourney Pro Seat · MKT-99",
    owner: "Marketing",
    activity: "Idle 22d",
    risk: "Waste",
    cost: "$120/mo",
    icon: Users,
  },
];

function Pill({ kind }: { kind: "Active" | "Waste" | "Low" }) {
  if (kind === "Active") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-2 py-1 text-xs font-medium text-teal-300 ring-1 ring-teal-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
        Active
      </span>
    );
  }
  if (kind === "Waste") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Waste
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-900/40 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-800/60">
      Low
    </span>
  );
}

export function DashboardClient() {
  const [query, setQuery] = useState("");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [totalMonthlySpend, setTotalMonthlySpend] = useState<number>(48920);
  const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
  const [lastActivitySummary, setLastActivitySummary] = useState<string | null>(
    null
  );
  const [toastOpen, setToastOpen] = useState(false);
  const lastSeenActivityRef = useRef<string | null>(null);

  useEffect(() => {
    let canceled = false;

    async function tick() {
      try {
        const res = await fetch("/api/metrics", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          totalMonthlySpend: number;
          lastActivityAt: string | null;
          lastActivitySummary: string | null;
        };
        if (canceled) return;
        if (typeof data.totalMonthlySpend === "number") {
          setTotalMonthlySpend(data.totalMonthlySpend);
        }
        const nextAt = data.lastActivityAt ?? null;
        const nextSummary = data.lastActivitySummary ?? null;
        setLastActivityAt(nextAt);
        setLastActivitySummary(nextSummary);

        if (nextAt && nextAt !== lastSeenActivityRef.current) {
          lastSeenActivityRef.current = nextAt;
          setToastOpen(true);
          window.setTimeout(() => setToastOpen(false), 4500);
        }
      } catch {
        // ignore
      }
    }

    void tick();
    const id = window.setInterval(tick, 1500);
    return () => {
      canceled = true;
      window.clearInterval(id);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ASSETS;
    return ASSETS.filter((r) => {
      const hay = `${r.asset} ${r.owner} ${r.activity} ${r.risk} ${r.cost}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <div className="flex min-h-[100dvh] w-full">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav title="Dashboard" />

        <header className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/30 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-4 lg:px-6">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-100">
                Dashboard
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                AI spend governance across keys, seats, and memory systems.
              </div>
            </div>

            <div className="hidden md:flex md:w-[420px] md:items-center md:gap-2">
              <div className="flex w-full items-center gap-2 rounded-2xl bg-slate-900/40 px-4 py-2 ring-1 ring-slate-800/60">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search assets, accounts, keys…"
                  className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-200 ring-1 ring-slate-800/60 transition hover:bg-slate-900/70"
                type="button"
                onClick={() => setQuery("")}
                title="Clear search"
              >
                <Filter className="h-4 w-4 text-slate-300" />
              </button>
            </div>

            <div className="relative flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/40 text-slate-200 ring-1 ring-slate-800/60 transition hover:bg-slate-900/70"
                title="Notifications"
                onClick={() => setAlertsOpen((v) => !v)}
              >
                <Bell className="h-4 w-4" />
              </button>

              {alertsOpen ? (
                <div className="absolute right-0 top-12 w-[320px] rounded-2xl bg-slate-950/95 p-3 ring-1 ring-slate-800/70 backdrop-blur">
                  <div className="text-xs font-semibold text-slate-100">
                    Sentinel Alert
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    Sentinel Alert:{" "}
                    <span className="font-semibold text-amber-300">
                      3 Zombie Assets found
                    </span>
                    .
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      href="/active-assets"
                      className="text-xs font-medium text-teal-300 hover:text-teal-200"
                      onClick={() => setAlertsOpen(false)}
                    >
                      Review assets →
                    </Link>
                    <button
                      type="button"
                      className="rounded-xl bg-slate-900/40 px-3 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-slate-800/60 hover:bg-slate-900/70"
                      onClick={() => setAlertsOpen(false)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/40 text-slate-200 ring-1 ring-slate-800/60 transition hover:bg-slate-900/70"
                title="Help"
                onClick={() => {
                  setQuery("idle");
                }}
              >
                <CircleHelp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:px-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-6">
              <TopCards
                totalMonthlySpend={totalMonthlySpend}
                lastActivityAt={lastActivityAt}
              />

              <section className="overflow-hidden rounded-2xl bg-slate-950/60 ring-1 ring-slate-800/60 backdrop-blur">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-5 py-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">
                      Active Assets
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      Filtered by your search query.
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Showing{" "}
                    <span className="font-semibold text-slate-200">
                      {filtered.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-200">
                      {ASSETS.length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[860px]">
                    <div className="grid grid-cols-[1.4fr_.9fr_.8fr_.6fr_.6fr] gap-3 px-5 py-3 text-xs font-medium text-slate-400">
                      <div>Asset</div>
                      <div>Owner</div>
                      <div>Activity</div>
                      <div>Risk</div>
                      <div className="text-right">Cost</div>
                    </div>
                    <div className="divide-y divide-slate-800/60">
                      {filtered.map((r) => {
                        const Icon = r.icon;
                        return (
                          <div
                            key={r.asset}
                            className="grid grid-cols-[1.4fr_.9fr_.8fr_.6fr_.6fr] gap-3 px-5 py-4 text-sm text-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900/40 ring-1 ring-slate-800/60">
                                <Icon className="h-4 w-4 text-slate-100" />
                              </div>
                              <div className="min-w-0 truncate font-medium text-slate-100">
                                {r.asset}
                              </div>
                            </div>
                            <div className="self-center text-slate-300">
                              {r.owner}
                            </div>
                            <div className="self-center">
                              <Pill
                                kind={
                                  r.activity === "Active" ? "Active" : "Waste"
                                }
                              />
                            </div>
                            <div className="self-center">
                              <Pill kind={r.risk === "Low" ? "Low" : "Waste"} />
                            </div>
                            <div className="self-center text-right font-semibold text-slate-100">
                              {r.cost}
                            </div>
                          </div>
                        );
                      })}

                      {filtered.length === 0 ? (
                        <div className="px-5 py-8 text-sm text-slate-400">
                          No assets match “{query}”.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <SentinelFeed />
            </div>

            <ChatSidebar />
          </div>
        </main>
      </div>

      {toastOpen && lastActivitySummary ? (
        <div className="fixed bottom-4 right-4 z-40 w-[min(420px,calc(100vw-2rem))] rounded-2xl bg-slate-950/95 p-4 ring-1 ring-slate-800/70 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-100">
              Activity update
            </div>
            <button
              type="button"
              onClick={() => setToastOpen(false)}
              className="rounded-xl bg-slate-900/40 px-3 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-slate-800/60 hover:bg-slate-900/70"
            >
              Close
            </button>
          </div>
          <div className="mt-2 text-sm text-slate-200">{lastActivitySummary}</div>
          <div className="mt-1 text-xs text-slate-400">
            Total spend is now{" "}
            <span className="font-semibold text-slate-200">
              ${totalMonthlySpend.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            .
          </div>
        </div>
      ) : null}
    </div>
  );
}

