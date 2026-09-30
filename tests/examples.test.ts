import { expect, it } from "vitest";
import { EXAMPLES } from "@/lib/examples";
import { forecast } from "@/lib/forecast";
import { SAMPLES } from "@/lib/samples";

it("has a reading for every sample, lined up with its sentences", () => {
  for (const s of SAMPLES) {
    const r = EXAMPLES[s.text.trim()];
    expect(r).toBeDefined();
    for (const x of r.sentences) expect(s.text.trim().slice(x.start, x.end)).toBe(x.text);
  }
});

it("covers three different skies", () => {
  expect(SAMPLES.map((s) => forecast(EXAMPLES[s.text.trim()]).sky)).toEqual(["storm", "clear", "showers"]);
});
