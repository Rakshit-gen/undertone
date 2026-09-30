import { beforeEach, describe, expect, it, vi } from "vitest";

const evaluate = vi.fn();
vi.mock("ai", () => ({ experimental_evaluate: (o: unknown) => evaluate(o) }));
const { POST } = await import("@/app/api/read/route");

let ip = 0;
const call = (b: unknown) =>
  POST(new Request("http://x/api/read", { method: "POST", body: JSON.stringify(b), headers: { "x-forwarded-for": `10.0.0.${++ip}` } }));
const ok = { message: "Per my last email. Thanks!", recipient: "colleague", goal: "followup" };

describe("POST /api/read", () => {
  beforeEach(() => { evaluate.mockReset(); });

  it("rejects bad input without calling Jev", async () => {
    const res = await call({ message: "", recipient: "colleague", goal: "followup" });
    expect(res.status).toBe(400);
    expect(evaluate).not.toHaveBeenCalled();
  });

  it("returns a reading with timing and model", async () => {
    evaluate.mockResolvedValue({
      answers: { "flag.s1.passive": { type: "boolean", probability: 0.9 } },
      response: { modelId: "typesafe-ai/jev" },
    });
    const res = await call(ok);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.model).toBe("typesafe-ai/jev");
    expect(typeof json.ms).toBe("number");
    expect(json.sentences[0].flags[0].key).toBe("passive");
  });

  it("reports a missing gateway card as not connected", async () => {
    evaluate.mockImplementation(async () => { throw Object.assign(new Error("customer_verification_required"), { statusCode: 403 }); });
    const res = await call(ok);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_connected" });
  });

  it("reports other failures as unavailable", async () => {
    evaluate.mockImplementation(async () => { throw new Error("boom"); });
    expect((await (await call(ok)).json()).error).toBe("unavailable");
  });
});
