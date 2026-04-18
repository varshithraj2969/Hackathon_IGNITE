import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { ArrowUpRight, KeyRound, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";

const rows = [
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

export default function ActiveAssetsPage() {
  return (
    <div className="flex min-h-[100dvh] w-full">
      <Sidebar />
      <MobileNav title="Active Assets" />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Active Assets
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Keys, seats, and memory-backed systems currently in scope.
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/40 px-4 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-800/60 transition hover:bg-slate-900/70"
          >
            Back to Dashboard <ArrowUpRight className="h-4 w-4 text-teal-300" />
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-slate-950/60 ring-1 ring-slate-800/60">
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[1.4fr_.9fr_.8fr_.6fr_.6fr] gap-3 border-b border-slate-800/60 px-5 py-3 text-xs font-medium text-slate-400">
                <div>Asset</div>
                <div>Owner</div>
                <div>Activity</div>
                <div>Risk</div>
                <div className="text-right">Cost</div>
              </div>
              <div className="divide-y divide-slate-800/60">
                {rows.map((r) => {
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
                      <div className="self-center text-slate-300">{r.owner}</div>
                      <div className="self-center">
                        <Pill
                          kind={r.activity === "Active" ? "Active" : "Waste"}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

