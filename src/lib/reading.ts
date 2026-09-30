import type { Sentence } from "./sentences";
import { checkId, checksFor, FEEL_ID, flagId, gaugeId, MAX_SENTENCES, type Context } from "./questions";
import { CHECKS, FEELINGS, FLAG_AT, FLAGS, GAUGES, type CheckKey, type Feeling, type FlagKey, type GaugeKey } from "./signals";

type Answer =
  | { type: "boolean"; probability: number }
  | { type: "score"; score: number; probabilities?: Record<string, number> }
  | { type: "choice"; choice: string; probabilities?: Record<string, number> };

export type SentenceReading = Sentence & { flags: { key: FlagKey; p: number }[] };
export type CheckReading = { key: CheckKey; label: string; ok: boolean; p: number };
export type Reading = {
  sentences: SentenceReading[];
  /** 0 to 1 along each scale. */
  gauges: Record<GaugeKey, number>;
  /** Likely feelings, most likely first, trimmed to the ones that matter. */
  feel: { key: Feeling; p: number }[];
  checks: CheckReading[];
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Turn Jev's raw answers into what the page shows. Missing answers read as "nothing to report". */
export function readAnswers(answers: Record<string, Answer | undefined>, sentences: Sentence[], ctx: Context): Reading {
  const bool = (id: string) => { const a = answers[id]; return a?.type === "boolean" ? a.probability : 0; };

  const out: SentenceReading[] = sentences.map((s, i) => ({
    ...s,
    flags: i >= MAX_SENTENCES ? [] : (Object.keys(FLAGS) as FlagKey[])
      .map((key) => ({ key, p: bool(flagId(s.id, key)) }))
      .filter((f) => f.p >= FLAG_AT)
      .sort((a, b) => b.p - a.p),
  }));

  const gauges = Object.fromEntries((Object.keys(GAUGES) as GaugeKey[]).map((key) => {
    const a = answers[gaugeId(key)];
    const top = GAUGES[key].levels.length - 1;
    return [key, a?.type === "score" ? clamp(a.score / top) : 0.5];
  })) as Record<GaugeKey, number>;

  const f = answers[FEEL_ID];
  const probs = f?.type === "choice" ? (f.probabilities ?? { [f.choice]: 1 }) : {};
  const feel = Object.entries(probs)
    .filter(([k, p]) => k in FEELINGS && p >= 0.08)
    .map(([k, p]) => ({ key: k as Feeling, p }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 4);

  const checks = checksFor(ctx.goal).map((key) => {
    const p = bool(checkId(key));
    const { label, want } = CHECKS[key];
    return { key, label, p, ok: want ? p >= 0.5 : p < 0.5 };
  });

  return { sentences: out, gauges, feel, checks };
}
