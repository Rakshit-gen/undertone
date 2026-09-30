"use client";

import { useEffect, useRef, useState } from "react";
import type { Context } from "@/lib/questions";
import type { Reading } from "@/lib/reading";
import type { ReadError } from "@/app/api/read/route";

/** `text` is the exact (trimmed) message the reading belongs to, so offsets are never drawn over newer text. */
export type Result = Reading & { ms: number; model: string; text: string };
export type Status = "idle" | "reading" | "done" | "error";

const DEBOUNCE = 550;

/**
 * Reads the message as it is typed. Waits for a pause, cancels anything in flight
 * when the text changes, and reuses answers for text it has already read.
 */
export function useReading(message: string, ctx: Context) {
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ReadError | null>(null);
  const cache = useRef(new Map<string, Result>());

  useEffect(() => {
    const text = message.trim();
    if (!text) { setResult(null); setStatus("idle"); setError(null); return; }

    const key = `${ctx.recipient}|${ctx.goal}|${text}`;
    const hit = cache.current.get(key);
    if (hit) { setResult(hit); setStatus("done"); setError(null); return; }

    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("reading");
      try {
        const res = await fetch("/api/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, ...ctx }),
          signal: ctl.signal,
        });
        const json = await res.json().catch(() => ({ error: "unavailable" }));
        if (!res.ok) { setError(json.error ?? "unavailable"); setStatus("error"); return; }
        const next = { ...json, text };
        cache.current.set(key, next);
        setResult(next);
        setError(null);
        setStatus("done");
      } catch {
        if (!ctl.signal.aborted) { setError("unavailable"); setStatus("error"); }
      }
    }, DEBOUNCE);

    return () => { clearTimeout(timer); ctl.abort(); };
  }, [message, ctx.recipient, ctx.goal]); // eslint-disable-line react-hooks/exhaustive-deps

  return { result, status, error };
}
