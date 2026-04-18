import { BadgeDollarSign, Ghost, TrendingDown } from "lucide-react";
import { Sparkline } from "./Sparkline";

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-5 ring-1 ring-slate-800/60 backdrop-blur">
      {children}
    </div>
  );
}

type TopCardsProps = {
  totalMonthlySpend: number;
  lastActivityAt?: string | null;
};

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function TopCards({ totalMonthlySpend, lastActivityAt }: TopCardsProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <CardShell>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <BadgeDollarSign className="h-4 w-4 text-slate-400" />
              Total Monthly Spend
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
              ${formatMoney(totalMonthlySpend)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {lastActivityAt
                ? `Last activity: ${new Date(lastActivityAt).toLocaleTimeString()}`
                : "+6.3% vs last month"}
            </div>
          </div>
          <div className="text-teal-300">
            <Sparkline points={[8, 11, 10, 15, 14, 18, 16, 19, 22, 21]} />
          </div>
        </div>
      </CardShell>

      <CardShell>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <TrendingDown className="h-4 w-4 text-slate-400" />
              Projected Savings
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
              $12,340
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Next 30 days (if actions applied)
            </div>
          </div>
          <div className="inline-flex items-center rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300 ring-1 ring-teal-500/20">
            Active
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-slate-900/40 p-3 ring-1 ring-slate-800/60">
            <div className="text-slate-400">Seats</div>
            <div className="mt-1 font-semibold text-slate-100">$4.1k</div>
          </div>
          <div className="rounded-xl bg-slate-900/40 p-3 ring-1 ring-slate-800/60">
            <div className="text-slate-400">Keys</div>
            <div className="mt-1 font-semibold text-slate-100">$3.6k</div>
          </div>
          <div className="rounded-xl bg-slate-900/40 p-3 ring-1 ring-slate-800/60">
            <div className="text-slate-400">Storage</div>
            <div className="mt-1 font-semibold text-slate-100">$4.6k</div>
          </div>
        </div>
      </CardShell>

      <CardShell>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Ghost className="h-4 w-4 text-slate-400" />
              Zombie Assets
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
              17
            </div>
            <div className="mt-1 text-xs text-amber-300/90">
              Waste risk flagged (idle & still billing)
            </div>
          </div>
          <div className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-500/20">
            Waste
          </div>
        </div>
        <div className="mt-4 space-y-2 text-xs text-slate-400">
          <div className="flex items-center justify-between rounded-xl bg-slate-900/40 px-3 py-2 ring-1 ring-slate-800/60">
            <span>Idle API keys</span>
            <span className="font-semibold text-slate-200">6</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-900/40 px-3 py-2 ring-1 ring-slate-800/60">
            <span>Unused seats</span>
            <span className="font-semibold text-slate-200">8</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-900/40 px-3 py-2 ring-1 ring-slate-800/60">
            <span>Stale embeddings</span>
            <span className="font-semibold text-slate-200">3</span>
          </div>
        </div>
      </CardShell>
    </section>
  );
}

