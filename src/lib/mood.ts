/**
 * The page's mood, shared between the writing studio and the sky without re-rendering React.
 * The studio writes it; the sky's animation loop reads it every frame.
 */
export const mood = {
  /** Extra wind from typing. Decays back to calm on its own. */
  gust: 0,
  /** 0 calm to 1 stormy. Speeds the wind and thickens the rain. */
  storm: 0,
};

/** A keystroke's worth of wind, capped so a fast typist gets a breeze, not a gale. */
export function gust(amount = 0.35) {
  mood.gust = Math.min(3, mood.gust + amount);
}
