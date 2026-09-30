import { describe, expect, it } from "vitest";
import { buildQuestions, buildState, checksFor, FEEL_ID, flagId, gaugeId, MAX_SENTENCES } from "@/lib/questions";
import { splitSentences } from "@/lib/sentences";
import { FLAGS } from "@/lib/signals";

const ctx = { recipient: "manager", goal: "decline" } as const;

describe("buildQuestions", () => {
  it("asks every flag of every sentence, plus gauges, feel and goal checks", () => {
    const s = splitSentences("I can't take this on. Sorry.");
    const q = buildQuestions(s, ctx);
    expect(q[flagId("s2", "apology")]).toMatchObject({ type: "boolean" });
    expect(String(q[flagId("s1", "curt")].instructions)).toContain("I can't take this on.");
    expect(q[gaugeId("warmth")]).toMatchObject({ type: "score" });
    expect(q[FEEL_ID]).toMatchObject({ type: "choice" });
    const flags = Object.keys(q).filter((k) => k.startsWith("flag."));
    expect(flags).toHaveLength(2 * Object.keys(FLAGS).length);
    expect(Object.keys(q)).not.toContain("check.ask"); // not a decline check
    expect(Object.keys(q)).toContain("check.reason");
  });

  it("caps the sentences it asks about", () => {
    const s = splitSentences("Ok. ".repeat(MAX_SENTENCES + 5));
    const n = Object.keys(buildQuestions(s, ctx)).filter((k) => k.startsWith("flag.")).length;
    expect(n).toBe(MAX_SENTENCES * Object.keys(FLAGS).length);
  });

  it("only applies goal-specific checks to their goals", () => {
    expect(checksFor("apologise")).toContain("owns");
    expect(checksFor("update")).not.toContain("owns");
    expect(checksFor("update")).toContain("sarcasm");
  });

  it("describes the reader and goal in the state", () => {
    const st = buildState("Hi.", splitSentences("Hi."), ctx);
    expect(st).toMatchObject({ reader: "my manager", writer_wants_to: "say no to something", sentences: { s1: "Hi." } });
  });
});
