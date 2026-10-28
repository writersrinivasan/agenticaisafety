"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { KeyRound, Loader2, Lock, X, Check, ExternalLink } from "lucide-react";
import { DEFAULT_MODEL, maskKey, postJSON, useByok } from "@/lib/byok";

const SUGGESTED = [DEFAULT_MODEL, "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.1-8b-instant"];

export function KeyButton() {
  const { hasKey, key } = useByok();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`btn ${hasKey ? "btn-ghost" : "btn-primary"} !px-3 !py-1.5 text-xs`}
        title="Bring your own Groq API key"
      >
        <KeyRound className="h-3.5 w-3.5" />
        {hasKey ? <span className="font-mono">{maskKey(key)}</span> : "Groq key"}
        {hasKey && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
      </button>
      {/* Portal: the sticky nav uses backdrop-filter, which would otherwise trap this fixed overlay inside the nav. */}
      {open && createPortal(<KeyDialog onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function KeyDialog({ onClose }: { onClose: () => void }) {
  const byok = useByok();
  const [draft, setDraft] = useState(byok.key);
  const [model, setModel] = useState(byok.model);
  const [models, setModels] = useState<string[]>([]);
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "err"; msg?: string }>({ kind: "idle" });

  async function test() {
    setStatus({ kind: "busy" });
    try {
      const r = await postJSON<{ models: string[] }>("/api/groq/models", {}, { key: draft.trim(), model });
      setModels(r.models);
      setStatus({ kind: "ok", msg: `Key works — ${r.models.length} chat models available.` });
      if (r.models.length && !r.models.includes(model)) setModel(r.models.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : r.models[0]);
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Failed" });
    }
  }

  function save() {
    byok.setKey(draft);
    byok.setModel(model);
    onClose();
  }

  const options = Array.from(new Set([...(models.length ? models : SUGGESTED), model]));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-20" onClick={onClose}>
      <div className="card glow-border w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <KeyRound className="h-5 w-5 text-amber-300" /> Bring your own Groq key
          </h2>
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted">
          The AI Assistant and live labs run real LangGraph agents on Groq. Get a free key at{" "}
          <a className="inline-flex items-center gap-1 text-violet-300 underline" href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
            console.groq.com/keys <ExternalLink className="h-3 w-3" />
          </a>
          .
        </p>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">API key</label>
        <input className="input font-mono" type="password" placeholder="gsk_…" value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" />

        <label className="mb-1 mt-4 block text-xs font-semibold uppercase tracking-wide text-muted">Model</label>
        <div className="flex gap-2">
          <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
            {options.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button className="btn btn-ghost shrink-0" onClick={test} disabled={!draft.trim() || status.kind === "busy"}>
            {status.kind === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Test
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Pick a model that supports tool calling. “Test” loads the models your key can use.</p>

        {status.msg && (
          <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${status.kind === "ok" ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"}`}>{status.msg}</div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface-2 p-3 text-xs text-muted">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          Stored only in this browser&apos;s localStorage. Sent per request to this app&apos;s server, which forwards it to Groq and never stores or logs it. Use a
          workshop key you can revoke afterwards.
        </div>

        <div className="mt-5 flex justify-between gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => {
              byok.clear();
              setDraft("");
              setStatus({ kind: "idle" });
            }}
          >
            Remove key
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
