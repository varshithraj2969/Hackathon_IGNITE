import Link from "next/link";
import { Activity, Database, LayoutDashboard, Settings } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const nav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Active Assets", href: "/active-assets", icon: Activity },
  { label: "Memory Logs", href: "/memory-logs", icon: Database },
  { label: "Settings", href: "/settings/keys", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:gap-6 md:border-r md:border-slate-800/60 md:bg-slate-950/40 md:p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 ring-1 ring-slate-800/60">
          <span className="text-sm font-semibold tracking-wide text-teal-300">
            AR
          </span>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-100">
            AI Resource Sentinel
          </div>
          <div className="text-xs text-slate-400">Govern spend. Kill waste.</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 ring-1 ring-transparent transition hover:bg-slate-900/60 hover:text-slate-100 hover:ring-slate-800/60"
            >
              <Icon className="h-4 w-4 text-slate-400 group-hover:text-teal-300" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">Status</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-2 py-1 text-xs font-medium text-teal-300 ring-1 ring-teal-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Active
          </span>
        </div>
        <div className="mt-3 text-xs leading-5 text-slate-400">
          Watching for idle keys, unused seats, and runaway token burn.
        </div>
      </div>
    </aside>
  );
}

