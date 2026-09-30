import { describe, expect, it } from "vitest";
import { readAnswers } from "@/lib/reading";
import { splitSentences } from "@/lib/sentences";

const ctx = { recipient: "colleague", goal: "followup" } as const;
const s = splitSentences("Per my last email. Thanks!");

describe("readAnswers", () => {
  const r = readAnswers({
    "flag.s1.passive": { type: "boolean", probability: 0.91 },
    "flag.s1.curt": { type: "boolean", probability: 0.64 },
    "flag.s2.passive": { type: "boolean", probability: 0.2 },
    "gauge.warmth": { type: "score", score: 1 },
    feel: { type: "choice", choice: "annoyed", probabilities: { annoyed: 0.7, neutral: 0.25, hurt: 0.05 } },
    "check.ask": { type: "boolean", probability: 0.3 },
    "check.sarcasm": { type: "boolean", probability: 0.8 },
  }, s, ctx);

  it("keeps flags at or above the threshold, strongest first", () => {
    expect(r.sentences[0].flags.map((f) => f.key)).toEqual(["passive", "curt"]);
    expect(r.sentences[1].flags).toEqual([]);
  });

  it("normalises scores and defaults missing gauges to the middle", () => {
    expect(r.gauges.warmth).toBe(0.25);
    expect(r.gauges.clarity).toBe(0.5);
  });

  it("drops unlikely feelings", () => {
    expect(r.feel.map((f) => f.key)).toEqual(["annoyed", "neutral"]);
  });

  it("marks checks against the answer a good message gives", () => {
    const by = Object.fromEntries(r.checks.map((c) => [c.key, c.ok]));
    expect(by.ask).toBe(false);
    expect(by.sarcasm).toBe(false);
    expect(by.ultimatum).toBe(true);
  });
});
