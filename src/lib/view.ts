import type { Reading } from "./reading";
import type { FlagKey } from "./signals";

export type View = { threshold: number; hidden: ReadonlySet<FlagKey>; dismissed: ReadonlySet<string> };

/**
 * Applies what the person chose to see: sensitivity, hidden flag types and dismissed sentences.
 * Runs on the client, so changing any of them is instant and costs nothing.
 */
export function applyView<R extends Reading>(r: R, v: View): R {
  return {
    ...r,
    sentences: r.sentences.map((s) => ({
      ...s,
      flags: v.dismissed.has(s.text) ? [] : s.flags.filter((f) => f.p >= v.threshold && !v.hidden.has(f.key)),
    })),
  };
}
