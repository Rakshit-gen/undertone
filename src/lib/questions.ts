import type { Experimental_EvaluationQuestion as Question } from "ai";
import type { Sentence } from "./sentences";
import { CHECKS, FEELINGS, FLAGS, GAUGES, GOALS, RECIPIENTS, type CheckKey, type Goal, type Recipient } from "./signals";

export type Context = { recipient: Recipient; goal: Goal };

/** Question ids are structured so reading the answers back needs no lookup table. */
export const flagId = (sentence: string, flag: string) => `flag.${sentence}.${flag}`;
export const gaugeId = (gauge: string) => `gauge.${gauge}`;
export const checkId = (check: string) => `check.${check}`;
export const FEEL_ID = "feel";

export const MAX_SENTENCES = 40;

export function checksFor(goal: Goal): CheckKey[] {
  return (Object.keys(CHECKS) as CheckKey[]).filter((k) => {
    const goals = (CHECKS[k] as { goals?: readonly Goal[] }).goals;
    return !goals || goals.includes(goal);
  });
}

export function buildState(message: string, sentences: Sentence[], ctx: Context) {
  return {
    reader: RECIPIENTS[ctx.recipient],
    writer_wants_to: GOALS[ctx.goal],
    message,
    sentences: Object.fromEntries(sentences.map((s) => [s.id, s.text])),
  };
}

export function buildQuestions(sentences: Sentence[], ctx: Context): Record<string, Question> {
  const q: Record<string, Question> = {};
  const reader = RECIPIENTS[ctx.recipient];

  for (const s of sentences.slice(0, MAX_SENTENCES)) {
    for (const [key, f] of Object.entries(FLAGS)) {
      q[flagId(s.id, key)] = { type: "boolean", instructions: `Sentence ${s.id} ("${s.text}"), read by ${reader}, ${f.ask}.` };
    }
  }
  for (const [key, g] of Object.entries(GAUGES)) {
    q[gaugeId(key)] = { type: "score", instructions: `${g.ask}, when read by ${reader}.`, criteria: [...g.levels] };
  }
  q[FEEL_ID] = {
    type: "choice",
    instructions: `How ${reader} is most likely to feel right after reading the message.`,
    criteria: Object.fromEntries(Object.keys(FEELINGS).map((k) => [k, null])),
  };
  for (const key of checksFor(ctx.goal)) {
    q[checkId(key)] = { type: "boolean", instructions: `${CHECKS[key].ask}.` };
  }
  return q;
}
