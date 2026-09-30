"use client";

import { useEffect, useState } from "react";
import type { Context } from "@/lib/questions";
import type { Reading } from "@/lib/reading";
import type { ReadError } from "@/app/api/read/route";

/** `text` is the exact (trimmed) message the reading belongs to, so offsets are never drawn over newer text. */
export type Result = Reading & { ms: number; model: string; text: string };
export type Status = "idle" | "reading" | "done" | "error";

const DEBOUNCE = 550;

type Last = { key: string; result: Result | null; error: ReadError | null };

/**
 * Reads the message as it is typed. Waits for a pause, cancels anything in flight
 * when the text changes, and reuses answers for text it has already read.
 * State only changes when a request settles; everything else is derived while rendering.
 */
export function useReading(message: string, ctx: Context) {
  const [cache, setCache] = useState<ReadonlyMap<string, Result>>(new Map());
  const [last, setLast] = useState<Last | null>(null);
  const [shown, setShown] = useState<Result | null>(null);

  const text = message.trim();
  const key = `${ctx.recipient}|${ctx.goal}|${text}`;
  const hit = text ? cache.get(key) : undefined;

  useEffect(() => {
    if (!text || cache.has(key)) return;
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, recipient: ctx.recipient, goal: ctx.goal }),
          signal: ctl.signal,
        });
        const json = await res.json().catch(() => ({ error: "unavailable" }));
        if (!res.ok) { setLast({ key, result: null, error: json.error ?? "unavailable" }); return; }
        const next: Result = { ...json, text };
        setCache((c) => new Map(c).set(key, next));
        setLast({ key, result: next, error: null });
        setShown(next);
      } catch {
        if (!ctl.signal.aborted) setLast({ key, result: null, error: "unavailable" });
      }
    }, DEBOUNCE);
    return () => { clearTimeout(timer); ctl.abort(); };
  }, [key, text, ctx.recipient, ctx.goal, cache]);

  if (!text) return { result: null, status: "idle" as Status, error: null };
  if (hit) return { result: hit, status: "done" as Status, error: null };
  if (last?.key === key && last.error) return { result: shown, status: "error" as Status, error: last.error };
  // While a new read is pending, keep showing the previous one so the panel doesn't flash empty.
  return { result: shown, status: "reading" as Status, error: null };
}
