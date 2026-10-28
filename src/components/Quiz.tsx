"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { QUIZ } from "@/lib/content/session";

export function Quiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const done = Object.keys(answers).length;
  const score = QUIZ.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div>
      <div className="card mb-4 flex items-center gap-4 p-4">
        <div className="text-3xl font-black text-gradient">
          {score}/{QUIZ.length}
        </div>
        <div className="flex-1 text-sm text-muted">
          {done < QUIZ.length ? `${QUIZ.length - done} question(s) to go` : score >= 8 ? "Excellent — you're ready to ship agents responsibly 🚀" : "Good effort — revisit the playbook for the ones you missed."}
        </div>
        <button className="btn btn-ghost" onClick={() => setAnswers({})}>
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {QUIZ.map((q, i) => {
          const a = answers[i];
          return (
            <div key={i} className="card p-5">
              <div className="mb-3 font-semibold">
                <span className="mr-2 text-pink-300">Q{i + 1}.</span>
                {q.q}
              </div>
              <div className="space-y-2">
                {q.options.map((o, j) => {
                  const state = a === undefined ? "" : j === q.answer ? "border-emerald-500/60 bg-emerald-500/10" : j === a ? "border-rose-500/60 bg-rose-500/10" : "opacity-60";
                  return (
                    <button key={j} disabled={a !== undefined} onClick={() => setAnswers({ ...answers, [i]: j })} className={`w-full rounded-lg border border-line p-2.5 text-left text-sm ${state}`}>
                      {o}
                    </button>
                  );
                })}
              </div>
              {a !== undefined && <p className={`mt-3 text-xs ${a === q.answer ? "text-emerald-300" : "text-amber-200"}`}>{q.why}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
