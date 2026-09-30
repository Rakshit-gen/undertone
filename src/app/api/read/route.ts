import { experimental_evaluate as evaluate } from "ai";
import { z } from "zod";
import { buildQuestions, buildState } from "@/lib/questions";
import { readAnswers } from "@/lib/reading";
import { allow } from "@/lib/rate-limit";
import { splitSentences } from "@/lib/sentences";
import { GOALS, RECIPIENTS, type Goal, type Recipient } from "@/lib/signals";

const MODEL = "typesafe-ai/jev";

const body = z.object({
  message: z.string().trim().min(1).max(4000),
  recipient: z.enum(Object.keys(RECIPIENTS) as [Recipient, ...Recipient[]]),
  goal: z.enum(Object.keys(GOALS) as [Goal, ...Goal[]]),
});

export type ReadError = "invalid" | "limited" | "not_connected" | "unavailable";
const fail = (error: ReadError, status: number) => Response.json({ error }, { status });

/** Gateway errors carry a status; a missing card or key shows up as 401 or 403. */
function classify(e: unknown): ReadError {
  const status = (e as { statusCode?: number })?.statusCode;
  const text = String((e as Error)?.message ?? "").toLowerCase();
  if (status === 401 || status === 403 || /verification|credit card|api key|oidc|unauthori/.test(text)) return "not_connected";
  if (status === 429) return "limited";
  return "unavailable";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allow(ip)) return fail("limited", 429);

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("invalid", 400);
  const { message, ...ctx } = parsed.data;

  const sentences = splitSentences(message);
  const started = performance.now();
  try {
    const res = await evaluate({
      model: MODEL,
      state: buildState(message, sentences, ctx),
      questions: buildQuestions(sentences, ctx),
      abortSignal: AbortSignal.any([req.signal, AbortSignal.timeout(15_000)]),
      maxRetries: 1,
    });
    return Response.json({
      ms: Math.round(performance.now() - started),
      model: res.response.modelId,
      ...readAnswers(res.answers, sentences, ctx),
    });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    const code = classify(e);
    console.error("[read]", code, (e as { statusCode?: number })?.statusCode ?? "", String((e as Error)?.message ?? e).slice(0, 200));
    return fail(code, code === "not_connected" ? 503 : code === "limited" ? 429 : 502);
  }
}
