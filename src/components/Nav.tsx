"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShieldAlert, X } from "lucide-react";
import { KeyButton } from "./KeyDialog";

const LINKS = [
  { href: "/landscape", label: "Playbook" },
  { href: "/labs", label: "Hands-on Labs" },
  { href: "/use-cases", label: "Industry Cases" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/session", label: "2-hr Session" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-pink-500 to-amber-400">
            <ShieldAlert className="h-5 w-5 text-white" />
          </span>
          <span className="hidden sm:inline">
            Agent<span className="text-gradient">Safety</span> Lab
          </span>
        </Link>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${active(l.href) ? "bg-violet-500/20 text-violet-100" : "text-muted hover:text-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto md:ml-2">
          <KeyButton />
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-2 ${active(l.href) ? "bg-violet-500/20" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
