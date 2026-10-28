// Literal class strings so Tailwind can see them at build time.
export type Hue = "violet" | "pink" | "amber" | "emerald" | "cyan" | "rose" | "sky" | "lime" | "orange" | "fuchsia";

export const HUE: Record<Hue, { text: string; bg: string; border: string; chip: string; grad: string }> = {
  violet: { text: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/40", chip: "bg-violet-500/20 text-violet-200", grad: "from-violet-500 to-indigo-500" },
  pink: { text: "text-pink-300", bg: "bg-pink-500/10", border: "border-pink-500/40", chip: "bg-pink-500/20 text-pink-200", grad: "from-pink-500 to-rose-500" },
  amber: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/40", chip: "bg-amber-500/20 text-amber-100", grad: "from-amber-400 to-orange-500" },
  emerald: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/40", chip: "bg-emerald-500/20 text-emerald-100", grad: "from-emerald-400 to-teal-500" },
  cyan: { text: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/40", chip: "bg-cyan-500/20 text-cyan-100", grad: "from-cyan-400 to-sky-500" },
  rose: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/40", chip: "bg-rose-500/20 text-rose-100", grad: "from-rose-500 to-red-500" },
  sky: { text: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/40", chip: "bg-sky-500/20 text-sky-100", grad: "from-sky-400 to-blue-500" },
  lime: { text: "text-lime-300", bg: "bg-lime-500/10", border: "border-lime-500/40", chip: "bg-lime-500/20 text-lime-100", grad: "from-lime-400 to-green-500" },
  orange: { text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/40", chip: "bg-orange-500/20 text-orange-100", grad: "from-orange-400 to-red-500" },
  fuchsia: { text: "text-fuchsia-300", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/40", chip: "bg-fuchsia-500/20 text-fuchsia-100", grad: "from-fuchsia-500 to-purple-500" },
};

export const SEVERITY_CLASS: Record<string, string> = {
  Critical: "bg-rose-500/25 text-rose-100 border-rose-500/50",
  High: "bg-orange-500/25 text-orange-100 border-orange-500/50",
  Medium: "bg-amber-500/20 text-amber-100 border-amber-500/50",
  Low: "bg-emerald-500/20 text-emerald-100 border-emerald-500/50",
};
