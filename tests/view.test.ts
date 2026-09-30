import { expect, it } from "vitest";
import type { Reading } from "@/lib/reading";
import { applyView } from "@/lib/view";

const r: Reading = {
  gauges: { warmth: .5, confidence: .5, clarity: .5 }, feel: [], checks: [],
  sentences: [
    { id: "s1", text: "A.", start: 0, end: 2, flags: [{ key: "passive", p: .9 }, { key: "hedge", p: .45 }] },
    { id: "s2", text: "B.", start: 3, end: 5, flags: [{ key: "curt", p: .7 }] },
  ],
};
const keys = (x: Reading) => x.sentences.map((s) => s.flags.map((f) => f.key));

it("filters by sensitivity, hidden types and dismissed sentences", () => {
  expect(keys(applyView(r, { threshold: .6, hidden: new Set(), dismissed: new Set() }))).toEqual([["passive"], ["curt"]]);
  expect(keys(applyView(r, { threshold: .4, hidden: new Set(), dismissed: new Set() }))).toEqual([["passive", "hedge"], ["curt"]]);
  expect(keys(applyView(r, { threshold: .4, hidden: new Set(["passive"]), dismissed: new Set(["B."]) }))).toEqual([["hedge"], []]);
});
