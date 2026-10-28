"use client";

import { useSyncExternalStore } from "react";

/**
 * Bring-Your-Own-Key store. The Groq key lives only in this browser's
 * localStorage and is sent to our API routes per request in a header.
 * The server never persists or logs it.
 */
const KEY_STORAGE = "agentsafety.groqKey";
const MODEL_STORAGE = "agentsafety.groqModel";
export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const listeners = new Set<() => void>();

function read(name: string): string {
  try {
    return window.localStorage.getItem(name) ?? "";
  } catch {
    return "";
  }
}

function write(name: string, value: string) {
  try {
    if (value) window.localStorage.setItem(name, value);
    else window.localStorage.removeItem(name);
  } catch {
    /* storage blocked: key just won't persist */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useByok() {
  const key = useSyncExternalStore(subscribe, () => read(KEY_STORAGE), () => "");
  const storedModel = useSyncExternalStore(subscribe, () => read(MODEL_STORAGE), () => "");
  return {
    key,
    model: storedModel || DEFAULT_MODEL,
    hasKey: key.length > 0,
    setKey: (v: string) => write(KEY_STORAGE, v.trim()),
    setModel: (v: string) => write(MODEL_STORAGE, v.trim()),
    clear: () => {
      write(KEY_STORAGE, "");
    },
  };
}

export function maskKey(key: string) {
  if (!key) return "";
  return key.length <= 10 ? "••••" : `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export async function postJSON<T>(
  url: string,
  body: unknown,
  creds: { key: string; model: string },
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-groq-key": creds.key,
      "x-groq-model": creds.model,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}
