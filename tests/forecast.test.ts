import { describe, expect, it } from "vitest";
import { forecast } from "@/lib/forecast";
import type { Reading } from "@/lib/reading";

const base = (): Reading => ({ sentences: [], gauges: { warmth: 0.7, confidence: 0.6, clarity: 0.8 }, feel: [], checks: [] });
const withFlag = (key: "passive" | "defensive" | "vague", p: number): Reading => ({
  ...base(),
  sentences: [{ id: "s1", text: "x", start: 0, end: 1, flags: [{ key, p }] }],
});

describe("forecast", () => {
  it("is clear when nothing is flagged", () => expect(forecast(base()).sky).toBe("clear"));
  it("storms on a strong storm flag", () => expect(forecast(withFlag("passive", 0.9)).sky).toBe("storm"));
  it("storms on sarcasm even without flags", () => {
    expect(forecast({ ...base(), checks: [{ key: "sarcasm", label: "", ok: false, p: 0.85 }] }).sky).toBe("storm");
  });
  it("shows showers for rain flags", () => expect(forecast(withFlag("defensive", 0.7)).sky).toBe("showers"));
  it("is overcast for vague lines or low clarity", () => {
    expect(forecast(withFlag("vague", 0.7)).sky).toBe("overcast");
    expect(forecast({ ...base(), gauges: { warmth: 0.7, confidence: 0.6, clarity: 0.3 } }).sky).toBe("overcast");
  });
  it("is partly cloudy when cool but fine", () => {
    expect(forecast({ ...base(), gauges: { warmth: 0.3, confidence: 0.6, clarity: 0.8 } }).sky).toBe("partly");
  });
});
