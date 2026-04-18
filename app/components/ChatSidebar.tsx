"use client";

import { useMemo, useRef, useState } from "react";
import { Brain, CornerDownLeft, Search, Sparkles } from "lucide-react";

type Memory = { type: string; text: string };
type ChatMsg = { role: "user" | "assistant"; text: string; memories?: Memory[] };

export function ChatSidebar() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "I can Recall memories about idle accounts and recommend actions. Ask me what to decommission, rotate, or pause.",
    },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const canSend = input.trim().length > 0 && !busy;

  const placeholderSuggestions = useMemo(
    () => [
      "Recall idle accounts still billing",
      "Which API keys were unused for 30+ days?",
      "Summarize waste risks this week",
    ],
    []
  );

  async function send(mode: "reflect" | "recall") {
    const msg = input.trim();
    if (!msg) return;

    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: msg, mode }),
      });

      const data = (await res.json()) as
        | { error: string }
        | { response?: string; memories?: Memory[]; mode: string };

      if (!res.ok) {
        const err = "error" in data ? data.error : "Request failed";
        setMessages((m) => [
          ...m,
          { role: "assistant", text: `Error: ${err}` },
        ]);
        return;
      }

      if (mode === "recall") {
        const memories = "memories" in data ? data.memories ?? [] : [];
        const text =
          memories.length > 0
            ? "Here are the most relevant memories I found."
            : "I couldn't find relevant memories in your bank.";
        setMessages((m) => [...m, { role: "assistant", text, memories }]);
      } else {
        const memories = "memories" in data ? data.memories ?? [] : [];
        const response = "response" in data ? data.response ?? "" : "";
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: response || "No response returned.",
            memories,
          },
        ]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Error: network failure" },
      ]);
    } finally {
      setBusy(false);
      queueMicrotask(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }

  return (
    <aside className="hidden xl:flex xl:w-[380px] xl:flex-col xl:border-l xl:border-slate-800/60 xl:bg-slate-950/40">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900/40 ring-1 ring-slate-800/60">
            <Brain className="h-4 w-4 text-teal-300" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-100">Chat</div>
            <div className="text-xs text-slate-400">Hindsight Recall</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const s =
              placeholderSuggestions[
                Math.floor(Math.random() * placeholderSuggestions.length)
              ];
            setInput(s);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900/40 px-3 py-2 text-xs font-medium text-slate-200 ring-1 ring-slate-800/60 transition hover:bg-slate-900/70"
        >
          <Sparkles className="h-4 w-4 text-slate-300" />
          Suggest
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-auto px-5 py-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              m.role === "user"
                ? "ml-10 rounded-2xl bg-teal-500/10 p-3 text-sm text-slate-100 ring-1 ring-teal-500/20"
                : "mr-10 rounded-2xl bg-slate-900/40 p-3 text-sm text-slate-100 ring-1 ring-slate-800/60"
            }
          >
            <div className="whitespace-pre-wrap leading-6">{m.text}</div>
            {m.memories && m.memories.length > 0 ? (
              <div className="mt-3 border-t border-slate-800/60 pt-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  Recalled memories
                </div>
                <ul className="mt-2 space-y-2">
                  {m.memories.slice(0, 5).map((mem, j) => (
                    <li
                      key={`${idx}-${j}`}
                      className="rounded-xl bg-slate-950/30 px-3 py-2 text-xs text-slate-200 ring-1 ring-slate-800/60"
                    >
                      <div className="text-[11px] font-medium text-slate-400">
                        {mem.type}
                      </div>
                      <div className="mt-1 leading-5">{mem.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800/60 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="sr-only" htmlFor="chat-input">
              Message
            </label>
            <textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Ask Sentinel to recall idle accounts…"
              className="w-full resize-none rounded-2xl bg-slate-900/40 px-4 py-3 text-sm text-slate-100 ring-1 ring-slate-800/60 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send("reflect");
                }
              }}
            />
            <div className="mt-2 text-[11px] text-slate-500">
              Enter to send, Shift+Enter for newline.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={!canSend}
              onClick={() => void send("recall")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-800/60 transition hover:bg-slate-900/70 disabled:opacity-50"
              title="Recall only"
            >
              <Search className="h-4 w-4 text-teal-300" />
              Recall
            </button>
            <button
              type="button"
              disabled={!canSend}
              onClick={() => void send("reflect")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500/15 px-3 py-2 text-xs font-semibold text-teal-200 ring-1 ring-teal-500/25 transition hover:bg-teal-500/20 disabled:opacity-50"
              title="Recall + answer"
            >
              <CornerDownLeft className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
        {busy ? (
          <div className="mt-3 text-xs text-slate-400">Thinking…</div>
        ) : null}
      </div>
    </aside>
  );
}

