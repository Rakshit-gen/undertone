// ponytail: per-instance memory, so limits reset on cold start and aren't shared across instances. Move to a KV store if abuse shows up.
const hits = new Map<string, number[]>();

/** Sliding window: true if `key` has made fewer than `max` calls in the last `windowMs`. */
export function allow(key: string, max = 40, windowMs = 60_000, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}
