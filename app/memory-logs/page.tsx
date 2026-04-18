import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { ArrowUpRight, Database, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function MemoryLogsPage() {
  return (
    <div className="flex min-h-[100dvh] w-full">
      <Sidebar />
      <MobileNav title="Memory Logs" />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Memory Logs
            </div>
            <div className="mt-1 text-xs text-slate-400">
              The chat uses Hindsight Recall to fetch relevant context for idle
              assets.
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/40 px-4 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-800/60 transition hover:bg-slate-900/70"
          >
            Back to Dashboard <ArrowUpRight className="h-4 w-4 text-teal-300" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-950/60 p-5 ring-1 ring-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/40 ring-1 ring-slate-800/60">
                <Database className="h-4 w-4 text-teal-300" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">
                  Bank wiring
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  Configure `.env.local` to point at your bank.
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-slate-900/40 p-4 ring-1 ring-slate-800/60">
              <div className="text-xs text-slate-400">Required</div>
              <div className="mt-1 font-mono text-xs text-slate-200">
                HINDSIGHT_API_KEY
              </div>
              <div className="mt-3 text-xs text-slate-400">Optional</div>
              <div className="mt-1 font-mono text-xs text-slate-200">
                HINDSIGHT_BASE_URL, HINDSIGHT_BANK_ID
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/60 p-5 ring-1 ring-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/40 ring-1 ring-slate-800/60">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">
                  “Remembering” behavior
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  When Recall finds memories, responses will start with “Based
                  on my memory…”.
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs leading-6 text-slate-400">
              Tip: click <span className="text-slate-200">Suggest</span> in the
              chat sidebar, then use <span className="text-slate-200">Recall</span>{" "}
              to see the raw memories returned from your bank.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

