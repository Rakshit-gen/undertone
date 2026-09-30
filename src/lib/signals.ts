/**
 * Everything Undertone asks Jev, in one place. Wording matters: Jev reads instructions literally,
 * so each one names a single judgement from the reader's side.
 */

export const RECIPIENTS = {
  manager: "my manager",
  colleague: "a colleague",
  report: "someone on my team",
  client: "a client",
  customer: "a customer",
  friend: "a friend",
  stranger: "someone I don't know",
} as const;
export type Recipient = keyof typeof RECIPIENTS;

export const GOALS = {
  ask: "ask for something",
  decline: "say no to something",
  apologise: "apologise",
  followup: "follow up",
  feedback: "give feedback",
  update: "share an update",
} as const;
export type Goal = keyof typeof GOALS;

/** Asked of every sentence. `tone` sets how serious a hit is when drawn on the page. */
export const FLAGS = {
  passive: { label: "Passive-aggressive", tone: "storm", ask: "reads as passive-aggressive to the reader", tip: "Say the thing directly. If you're frustrated, name the problem, not the person." },
  blame: { label: "Blames the reader", tone: "storm", ask: "blames or accuses the reader", tip: "Describe what happened and what you need next, without pointing at them." },
  curt: { label: "Curt", tone: "storm", ask: "comes across as curt or dismissive", tip: "Add a word of context or thanks so it doesn't read as a brush-off." },
  defensive: { label: "Defensive", tone: "rain", ask: "sounds defensive or self-justifying", tip: "Drop the justification. State the facts once and move to next steps." },
  apology: { label: "Over-apologetic", tone: "rain", ask: "apologises more than the situation needs", tip: "One apology is enough. Replace the rest with what you'll do." },
  hedge: { label: "Hedged", tone: "cloud", ask: "is hedged or tentative enough to weaken the point", tip: "Cut the softeners (just, maybe, I think) and say what you mean." },
  vague: { label: "Vague", tone: "cloud", ask: "is too vague for the reader to act on", tip: "Add the specific: what, by when, and who." },
} as const;
export type FlagKey = keyof typeof FLAGS;
export type Tone = (typeof FLAGS)[FlagKey]["tone"];

/** Scales for the whole message, lowest level first. */
export const GAUGES = {
  warmth: { label: "Warmth", low: "Cold", high: "Warm", ask: "How warm the message feels to the reader", levels: ["Cold", "Cool", "Neutral", "Friendly", "Warm"] },
  confidence: { label: "Confidence", low: "Unsure", high: "Assured", ask: "How confident the writer sounds", levels: ["Very unsure", "Hesitant", "Even", "Confident", "Assured"] },
  clarity: { label: "Clarity", low: "Muddy", high: "Clear", ask: "How easy it is for the reader to understand what the writer means and wants", levels: ["Confusing", "Unclear in places", "Understandable", "Clear", "Very clear"] },
} as const;
export type GaugeKey = keyof typeof GAUGES;

export const FEELINGS = {
  reassured: "Reassured", respected: "Respected", grateful: "Grateful", neutral: "Neutral",
  confused: "Confused", pressured: "Pressured", annoyed: "Annoyed", hurt: "Hurt", defensive: "Defensive",
} as const;
export type Feeling = keyof typeof FEELINGS;

/** Whole-message checks. `want` is the answer a good message gives. `goals` limits a check to the goals it applies to. */
export const CHECKS = {
  ask: { label: "Makes a clear request", want: true, ask: "The message makes a clear request or states the next step", fix: "End with the one thing you need, and by when.", goals: ["ask", "followup", "feedback"] },
  reason: { label: "Explains why", want: true, ask: "The message explains the reason behind the request or decision", fix: "Add a sentence on why. People agree more easily when they see the reason.", goals: ["ask", "decline", "feedback", "apologise"] },
  owns: { label: "Takes responsibility", want: true, ask: "The writer takes clear responsibility without making excuses", fix: "Say what went wrong in the first person, then what you'll do about it.", goals: ["apologise"] },
  length: { label: "No longer than needed", want: true, ask: "The message is no longer than it needs to be for its purpose", fix: "Cut anything the reader doesn't need to act or understand." },
  close: { label: "Ends on good terms", want: true, ask: "The message ends in a way that invites a reply or leaves things on good terms", fix: "Close with a thank you, an offer to help, or a question they can answer." },
  sarcasm: { label: "Free of sarcasm", want: false, ask: "The message uses sarcasm", fix: "Say the literal thing. Sarcasm reads as contempt in writing." },
  ultimatum: { label: "No ultimatums", want: false, ask: "The message contains an ultimatum or a veiled threat", fix: "Replace the 'or else' with what happens next and why it matters." },
  jargon: { label: "Plain language", want: false, ask: "The message relies on jargon or acronyms the reader may not know", fix: "Spell out acronyms and swap insider terms for plain words." },
} as const satisfies Record<string, { label: string; want: boolean; ask: string; fix: string; goals?: readonly Goal[] }>;
export type CheckKey = keyof typeof CHECKS;

/** A sentence is flagged once Jev puts the probability at or above this. People can move it with the sensitivity slider. */
export const FLAG_AT = 0.6;
/** The server keeps anything above this, so the slider can reveal weaker signals without asking Jev again. */
export const FLAG_FLOOR = 0.3;
