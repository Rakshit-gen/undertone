import { describe, expect, it } from "vitest";
import { splitSentences } from "@/lib/sentences";

const texts = (s: string) => splitSentences(s).map((x) => x.text);

describe("splitSentences", () => {
  it("splits on terminal punctuation and keeps exact offsets", () => {
    const src = "Hi Sam.  Thanks for this! Can we talk?";
    const out = splitSentences(src);
    expect(out.map((s) => s.text)).toEqual(["Hi Sam.", "Thanks for this!", "Can we talk?"]);
    for (const s of out) expect(src.slice(s.start, s.end)).toBe(s.text);
    expect(out.map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
  });

  it("treats line breaks as boundaries", () => {
    expect(texts("Hi Sam,\n\nI wanted to follow up\nBest,\nAna")).toEqual(["Hi Sam,", "I wanted to follow up", "Best,", "Ana"]);
  });

  it("does not split numbers, domains or common abbreviations", () => {
    expect(texts("Revenue grew 3.5 percent, see example.com for details. Dr. Lee agreed, e.g. on pricing.")).toEqual([
      "Revenue grew 3.5 percent, see example.com for details.",
      "Dr. Lee agreed, e.g. on pricing.",
    ]);
  });

  it("keeps runs of punctuation and closing quotes together", () => {
    expect(texts('Really?! He said "no." Fine...')).toEqual(["Really?!", 'He said "no."', "Fine..."]);
  });

  it("returns nothing for blank input", () => {
    expect(splitSentences("  \n ")).toEqual([]);
  });
});
