"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Database,
  LayoutDashboard,
  Menu,
  Settings,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Active Assets", href: "/active-assets", icon: Activity },
  { label: "Memory Logs", href: "/memory-logs", icon: Database },
  { label: "Settings", href: "/settings/keys", icon: Settings },
];

export function MobileNav({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items = useMemo(() => NAV, []);

  useEffect(() => {
    // Close on navigation.
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="sticky top-0 z-10 md:hidden border-b border-slate-800/60 bg-slate-950/30 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/40 text-slate-200 ring-1 ring-slate-800/60"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-100">
              {title}
            </div>
            <div className="truncate text-xs text-slate-400">
              AI Resource Sentinel
            </div>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/55"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[320px] bg-slate-950 ring-1 ring-slate-800/70">
            <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-4">
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-100">
                  AI Resource Sentinel
                </div>
                <div className="text-xs text-slate-400">
                  Govern spend. Kill waste.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/40 text-slate-200 ring-1 ring-slate-800/60"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-3">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm ring-1 transition",
                      active
                        ? "bg-slate-900/70 text-slate-100 ring-slate-800/60"
                        : "text-slate-300 ring-transparent hover:bg-slate-900/60 hover:text-slate-100 hover:ring-slate-800/60",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

