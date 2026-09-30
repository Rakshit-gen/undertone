export type Sentence = { id: string; text: string; start: number; end: number };

// Common abbreviations that end in a full stop but do not end a sentence.
const ABBREV = /(?:\b(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|e\.g|i\.e|approx|dept|inc|ltd|co)\.)$/i;

/**
 * Split text into sentences with their character offsets, so highlights can be drawn
 * over the exact source text. Line breaks always end a sentence (greetings, sign-offs, lists).
 */
export function splitSentences(text: string): Sentence[] {
  const out: Sentence[] = [];
  let start = 0;

  const push = (end: number) => {
    const raw = text.slice(start, end);
    const lead = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();
    if (trimmed) out.push({ id: `s${out.length + 1}`, text: trimmed, start: start + lead, end: start + lead + trimmed.length });
    start = end;
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") { push(i + 1); continue; }
    if (ch !== "." && ch !== "!" && ch !== "?") continue;
    // Swallow runs like "?!" or "..." and a closing quote or bracket.
    let j = i;
    while (j + 1 < text.length && /[.!?"'”’)\]]/.test(text[j + 1])) j++;
    const next = text[j + 1];
    if (next !== undefined && !/\s/.test(next)) { i = j; continue; } // "3.5", "example.com"
    if (ch === "." && ABBREV.test(text.slice(Math.max(0, i - 6), i + 1))) { i = j; continue; }
    push(j + 1);
    i = j;
  }
  push(text.length);
  return out;
}
