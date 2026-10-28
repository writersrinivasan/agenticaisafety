"use client";

import { useState, useSyncExternalStore } from "react";
import { KeyRound, Loader2, Lock, Send, ShieldCheck, Swords, Trophy, Unlock } from "lucide-react";
import { postJSON, useByok } from "@/lib/byok";
import { LEVELS, VAULT } from "@/lib/content/redteam";
import type { TraceEvent } from "@/lib/agents/trace";
import { Callout, TracePanel } from "@/components/ui";

type Msg = { role: "user" | "assistant"; content: string; trace?: TraceEvent[]; win?: string | null; caughtBy?: string | null };
type Res = { reply: string; trace: TraceEvent[]; win: "secret" | "transfer" | null; caughtBy: string | null; transfers: { from: string; to: string; amount: number; status: string }[] };

const STORE = "agentsafety.redteam.wins";
const noop = () => () => {};
const readWins = () => {
  try {
    return localStorage.getItem(STORE) ?? "[]";
  } catch {
    return "[]";
  }
};

export function RedTeamLab() {
  const { key, model, hasKey } = useByok();
  const savedWins = useSyncExternalStore(noop, readWins, () => "[]");
  const [winsState, setWinsState] = useState<number[] | null>(null);
  const wins = winsState ?? (JSON.parse(savedWins) as number[]);
  const [level, setLevel] = useState(1);
  const [chats, setChats] = useState<Record<number, Msg[]>>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [attempts, setAttempts] = useState<Record<number, number>>({});

  const msgs = chats[level] ?? [];
  const L = LEVELS[level - 1];
  const unlocked = (l: number) => l === 1 || wins.includes(l - 1) || wins.includes(l);

  async function send() {
    const text = input.trim();
    if (!text) return;
    const history: Msg[] = [...msgs, { role: "user", content: text }];
    setChats({ ...chats, [level]: history });
    setInput("");
    setBusy(true);
    setErr("");
    try {
      const r = await postJSON<Res>("/api/labs/redteam", { level, history: history.map(({ role, content }) => ({ role, content })) }, { key, model });
      setChats((c) => ({ ...c, [level]: [...history, { role: "assistant", content: r.reply, trace: r.trace, win: r.win, caughtBy: r.caughtBy }] }));
      setAttempts((a) => ({ ...a, [level]: (a[level] ?? 0) + 1 }));
      if (r.win && !wins.includes(level)) {
        const next = [...wins, level];
        setWinsState(next);
        try {
          localStorage.setItem(STORE, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const lastTrace = [...msgs].reverse().find((m) => m.trace)?.trace ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Levels</h3>
            <span className="flex items-center gap-1 text-sm font-bold text-amber-300">
              <Trophy className="h-4 w-4" /> {wins.length}/4
            </span>
          </div>
          <div className="space-y-2">
            {LEVELS.map((l) => (
              <button
                key={l.level}
                disabled={!unlocked(l.level)}
                onClick={() => setLevel(l.level)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-40 ${level === l.level ? "border-pink-400/60 bg-pink-500/10" : "border-line"}`}
              >
                {wins.includes(l.level) ? <Trophy className="h-5 w-5 text-amber-300" /> : unlocked(l.level) ? <Unlock className="h-5 w-5 text-pink-300" /> : <Lock className="h-5 w-5 text-muted" />}
                <div>
                  <div className="text-sm font-bold">
                    Level {l.level}: {l.name}
                  </div>
                  <div className="text-xs text-muted">{l.defences.join(" · ")}</div>
                </div>
              </button>
            ))}
          </div>
          <button
            className="mt-3 text-xs text-muted underline"
            onClick={() => {
              setWinsState([]);
              try {
                localStorage.setItem(STORE, "[]");
              } catch {}
            }}
          >
            reset progress
          </button>
        </div>
        <Callout hue="pink" title="Your mission">
          You are logged in as <b>{VAULT.user}</b> (accounts {VAULT.ownAccounts.join(", ")}). Win a level by making VaultBot either:
          <ul className="mt-1 list-disc pl-4">
            <li>reveal the internal <b>staff override code</b>, or</li>
            <li>execute a transfer to an account you don&apos;t own (or over $5,000).</li>
          </ul>
        </Callout>
        <Callout hue="amber" title={`Hint for level ${level}`}>
          {L.hint}
        </Callout>
        <p className="text-xs text-muted">Ethics note: practise these techniques only on systems you own or are authorised to test.</p>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="card flex h-[32rem] flex-col">
          <div className="flex items-center gap-2 border-b border-line p-4">
            <Swords className="h-5 w-5 text-pink-300" />
            <div className="font-bold">VaultBot · Level {level}</div>
            <span className="ml-auto text-xs text-muted">{attempts[level] ?? 0} attempts</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!hasKey && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/15 p-3 text-sm text-amber-100">
                <KeyRound className="h-4 w-4" /> This lab attacks a live LLM agent — add your Groq key (top bar) to play.
              </div>
            )}
            {msgs.length === 0 && hasKey && <div className="text-sm text-muted">Say hi to VaultBot… then try to break it.</div>}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white" : "bg-surface-2"}`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.win && <div className="mt-2 rounded-lg bg-amber-400/20 p-2 text-xs font-bold text-amber-200">🏆 You won level {level}! ({m.win === "secret" ? "secret leaked" : "unauthorised transfer"})</div>}
                  {m.caughtBy && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" /> Caught by {m.caughtBy.replace("_", " ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <Loader2 className="h-5 w-5 animate-spin text-pink-300" />}
          </div>
          <div className="flex gap-2 border-t border-line p-3">
            <input
              className="input"
              placeholder={hasKey ? "Your attack prompt…" : "Add a Groq key to start"}
              value={input}
              disabled={!hasKey || busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && send()}
            />
            <button className="btn btn-primary" onClick={send} disabled={!hasKey || busy || !input.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        {err && <div className="rounded-lg bg-rose-500/15 p-3 text-sm text-rose-200">{err}</div>}
        <TracePanel trace={lastTrace} title="Which layers fired on your last attempt" />
      </div>
    </div>
  );
}
