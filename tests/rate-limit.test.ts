import { expect, it } from "vitest";
import { allow } from "@/lib/rate-limit";

it("allows up to the limit inside the window, then again after it", () => {
  const t = 1_000_000;
  expect(allow("a", 2, 1000, t)).toBe(true);
  expect(allow("a", 2, 1000, t + 1)).toBe(true);
  expect(allow("a", 2, 1000, t + 2)).toBe(false);
  expect(allow("b", 2, 1000, t + 2)).toBe(true);
  expect(allow("a", 2, 1000, t + 1001)).toBe(true);
});
