import type { Reading } from "./reading";
import { FLAGS } from "./signals";

export type Sky = "clear" | "partly" | "overcast" | "showers" | "storm";

export const SKIES: Record<Sky, { title: string }> = {
  clear: { title: "Clear skies" },
  partly: { title: "Partly cloudy" },
  overcast: { title: "Overcast" },
  showers: { title: "Showers likely" },
  storm: { title: "Stormy" },
};

export type Forecast = { sky: Sky; title: string; line: string };

const BAD_CHECKS = new Set(["sarcasm", "ultimatum"]);

/**
 * One headline for the whole message. The worst signal wins, so a single
 * passive-aggressive line can't hide behind an otherwise warm note.
 */
export function forecast(r: Reading): Forecast {
  const flags = r.sentences.flatMap((s) => s.flags);
  const worst = (tone: string) => Math.max(0, ...flags.filter((f) => FLAGS[f.key].tone === tone).map((f) => f.p));
  const badCheck = Math.max(0, ...r.checks.filter((c) => BAD_CHECKS.has(c.key)).map((c) => c.p));
  const storm = Math.max(worst("storm"), badCheck);
  const count = flags.length;

  const pick = (sky: Sky, line: string): Forecast => ({ sky, title: SKIES[sky].title, line });

  if (storm > 0.8) return pick("storm", "At least one line is likely to land badly. Look at the marked sentences first.");
  if (storm > 0.6 || worst("rain") > 0.6) return pick("showers", "Mostly fine, but a line or two could sting.");
  if (worst("cloud") > 0.6 || r.gauges.clarity < 0.4) return pick("overcast", `The tone is fine. The point could be clearer${count ? `, ${count} spot${count === 1 ? "" : "s"} to tighten` : ""}.`);
  if (r.gauges.warmth < 0.45) return pick("partly", "Nothing wrong, just a little cool. A warmer opening or close would help.");
  return pick("clear", "This should land the way you mean it.");
}
