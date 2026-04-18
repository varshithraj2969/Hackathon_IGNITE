"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { MobileNav } from "../../components/MobileNav";
import { Eye, EyeOff, KeyRound, Loader2, Plus } from "lucide-react";

type KeyItem = {
  id: string;
  toolName: string;
  apiKey: string;
  assignedTeam: string;
  createdAt: string;
  lastUsedAt?: string | null;
};

function mask(s: string) {
  if (!s) return "";
  if (s.length <= 8) return "•".repeat(Math.max(4, s.length));
  return `${s.slice(0, 3)}••••••${s.slice(-4)}`;
}

export default function KeysSettingsPage() {
  const [items, setItems] = useState<KeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toolName, setToolName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");

  const canSubmit =
    toolName.trim().length > 0 &&
    apiKey.trim().length > 0 &&
    assignedTeam.trim().length > 0 &&
    !saving;

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/keys", { cache: "no-store" });
      const data = (await res.json()) as { items: KeyItem[] };
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const sorted = useMemo(() => items, [items]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolName,
          apiKey,
          assignedTeam,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to save key");
        return;
      }
      setToolName("");
      setApiKey("");
      setAssignedTeam("");
      await refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full">
      <Sidebar />
      <MobileNav title="Settings" />
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Settings · Keys
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Store tool keys locally for demo and governance workflows.
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/40 px-4 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-800/60">
            <KeyRound className="h-4 w-4 text-teal-300" />
            Local JSON store
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-2xl bg-slate-950/60 p-5 ring-1 ring-slate-800/60">
            <div className="text-sm font-semibold text-slate-100">
              Add API Key
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Stored in <span className="font-mono">data/keys.json</span>. To log
              usage from another machine, POST{" "}
              <span className="font-mono">/api/track-usage</span> with{" "}
              <span className="font-mono">Authorization: Bearer &lt;stored key&gt;</span>
              .
            </div>

            <form className="mt-4 space-y-3" onSubmit={onSubmit}>
              <div>
                <label className="text-xs font-medium text-slate-300">
                  Tool Name
                </label>
                <input
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="OpenAI / Anthropic / Figma…"
                  className="mt-1 w-full rounded-2xl bg-slate-900/40 px-4 py-3 text-sm text-slate-100 ring-1 ring-slate-800/60 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">
                  API Key (masked)
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl bg-slate-900/40 px-4 py-2 ring-1 ring-slate-800/60 focus-within:ring-2 focus-within:ring-teal-500/40">
                  <input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    type={show ? "text" : "password"}
                    placeholder="sk-…"
                    className="w-full bg-transparent py-1 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/40 text-slate-200 ring-1 ring-slate-800/60 hover:bg-slate-950/70"
                    title={show ? "Hide" : "Show"}
                  >
                    {show ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">
                  Assigned Team
                </label>
                <input
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  placeholder="Platform / Marketing / Design…"
                  className="mt-1 w-full rounded-2xl bg-slate-900/40 px-4 py-3 text-sm text-slate-100 ring-1 ring-slate-800/60 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              {error ? (
                <div className="rounded-2xl bg-amber-500/10 px-4 py-3 text-xs text-amber-200 ring-1 ring-amber-500/20">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-500/15 px-4 py-3 text-sm font-semibold text-teal-200 ring-1 ring-teal-500/25 transition hover:bg-teal-500/20 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add key
              </button>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl bg-slate-950/60 ring-1 ring-slate-800/60">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-100">
                  Stored Keys
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  Displayed masked; stored in plain text in JSON (demo only).
                </div>
              </div>
              <button
                type="button"
                onClick={() => void refresh()}
                className="rounded-xl bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-800/60 hover:bg-slate-900/70"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="px-5 py-10 text-sm text-slate-400">Loading…</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                <div className="grid grid-cols-[1.1fr_.8fr_.9fr_.6fr_.7fr] gap-3 px-5 py-3 text-xs font-medium text-slate-400">
                  <div>Tool</div>
                  <div>Team</div>
                  <div>API Key</div>
                  <div>Created</div>
                  <div>Last used</div>
                </div>
                {sorted.map((it) => (
                  <div
                    key={it.id}
                    className="grid grid-cols-[1.1fr_.8fr_.9fr_.6fr_.7fr] gap-3 px-5 py-4 text-sm text-slate-200"
                  >
                    <div className="min-w-0 truncate font-medium text-slate-100">
                      {it.toolName}
                    </div>
                    <div className="min-w-0 truncate text-slate-300">
                      {it.assignedTeam}
                    </div>
                    <div className="font-mono text-xs text-slate-200">
                      {mask(it.apiKey)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(it.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-400">
                      {it.lastUsedAt
                        ? new Date(it.lastUsedAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                ))}
                {sorted.length === 0 ? (
                  <div className="px-5 py-10 text-sm text-slate-400">
                    No keys stored yet.
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

