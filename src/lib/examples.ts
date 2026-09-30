import type { Result } from "@/hooks/useReading";
import { checksFor } from "./questions";
import { SAMPLES } from "./samples";
import { splitSentences } from "./sentences";
import { CHECKS, type CheckKey, type Feeling, type FlagKey, type GaugeKey } from "./signals";

type Spec = {
  flags: Partial<Record<FlagKey, number>>[];
  gauges: Record<GaugeKey, number>;
  feel: Partial<Record<Feeling, number>>;
  checks: Partial<Record<CheckKey, number>>;
};

/**
 * Hand-written readings for the three samples, so the page can be explored before Jev is connected.
 * They are labelled as examples wherever they show. Editing the text switches to a live read.
 */
const SPECS: Spec[] = [
  {
    flags: [{}, { passive: .88, vague: .34 }, { passive: .93, blame: .71, hedge: .41 }, { curt: .38 }],
    gauges: { warmth: .2, confidence: .6, clarity: .72 },
    feel: { annoyed: .55, defensive: .24, neutral: .14 },
    checks: { ask: .81, length: .84, close: .31, sarcasm: .74, ultimatum: .12, jargon: .03 },
  },
  {
    flags: [{}, { hedge: .36, defensive: .31 }, {}],
    gauges: { warmth: .76, confidence: .8, clarity: .9 },
    feel: { respected: .52, neutral: .28, grateful: .13 },
    checks: { reason: .93, length: .88, close: .86, sarcasm: .02, ultimatum: .04, jargon: .03 },
  },
  {
    flags: [{ apology: .95 }, { defensive: .86, vague: .4 }, { apology: .8, vague: .78, hedge: .7 }],
    gauges: { warmth: .55, confidence: .15, clarity: .38 },
    feel: { annoyed: .4, confused: .26, neutral: .2, reassured: .1 },
    checks: { reason: .44, owns: .12, length: .52, close: .47, sarcasm: .02, ultimatum: .01, jargon: .02 },
  },
];

export const EXAMPLES: Record<string, Result> = Object.fromEntries(SAMPLES.map((s, i) => {
  const spec = SPECS[i];
  const text = s.text.trim();
  const result: Result = {
    text, ms: 0, model: "example",
    sentences: splitSentences(text).map((sen, j) => ({
      ...sen,
      flags: Object.entries(spec.flags[j] ?? {}).map(([key, p]) => ({ key: key as FlagKey, p: p! })).sort((a, b) => b.p - a.p),
    })),
    gauges: spec.gauges,
    feel: Object.entries(spec.feel).map(([key, p]) => ({ key: key as Feeling, p: p! })),
    checks: checksFor(s.goal).map((key) => {
      const p = spec.checks[key] ?? 0;
      return { key, label: CHECKS[key].label, p, ok: CHECKS[key].want ? p >= .5 : p < .5 };
    }),
  };
  return [text, result];
}));
