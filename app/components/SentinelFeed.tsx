import { ArrowRightLeft, BadgeCheck, KeyRound, ShieldAlert } from "lucide-react";

type FeedItem = {
  title: string;
  detail: string;
  badge: "Active" | "Waste";
  icon: React.ComponentType<{ className?: string }>;
  time: string;
};

const items: FeedItem[] = [
  {
    title: "Reassigned GPT-4 Key",
    detail: "Rotated owner to Platform Team; revoked stale scopes.",
    badge: "Active",
    icon: KeyRound,
    time: "2m",
  },
  {
    title: "Paused idle seat",
    detail: "User inactive 41 days; billing will stop next cycle.",
    badge: "Waste",
    icon: ShieldAlert,
    time: "13m",
  },
  {
    title: "Rebalanced routing",
    detail: "Moved low-sensitivity workloads to cost-efficient model.",
    badge: "Active",
    icon: ArrowRightLeft,
    time: "42m",
  },
  {
    title: "Policy enforced",
    detail: "Blocked key creation without justification tag.",
    badge: "Active",
    icon: BadgeCheck,
    time: "1h",
  },
];

function Badge({ kind }: { kind: FeedItem["badge"] }) {
  if (kind === "Active") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-2 py-1 text-xs font-medium text-teal-300 ring-1 ring-teal-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Waste
    </span>
  );
}

export function SentinelFeed() {
  return (
    <section className="rounded-2xl bg-slate-950/60 ring-1 ring-slate-800/60 backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-slate-100">
            Sentinel Feed
          </div>
          <div className="mt-0.5 text-xs text-slate-400">
            Live decisions and automated governance actions.
          </div>
        </div>
        <div className="text-xs text-slate-400">Last sync: 14s ago</div>
      </div>

      <ul className="divide-y divide-slate-800/60">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={`${it.title}-${it.time}`} className="px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/40 ring-1 ring-slate-800/60">
                  <Icon className="h-4 w-4 text-slate-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-100">
                        {it.title}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {it.detail}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge kind={it.badge} />
                      <span className="text-xs text-slate-500">{it.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

