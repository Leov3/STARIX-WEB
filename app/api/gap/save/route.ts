import { NextResponse } from "next/server";
import { isGapBranch, questionsForBranch, validateGapAnswer } from "@/app/lib/gap";
import { forwardGap, isRateLimited, tokenFromRequest, unavailable } from "@/app/lib/gap-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isRateLimited(request)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const token = tokenFromRequest(request, body);
  const branch = body.branch;
  const questionId = body.questionId;
  const answer = body.answer;
  const currentStep = body.currentStep;
  if (!token || !isGapBranch(branch) || typeof questionId !== "string" || !Number.isInteger(currentStep)) return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  const question = questionsForBranch(branch).find((candidate) => candidate.id === questionId);
  if (!question || validateGapAnswer(question, answer)) return NextResponse.json({ ok: false, error: "invalid_answer" }, { status: 422 });
  try {
    const result = await forwardGap("save_answer", { token, branch, questionId, answer: (answer as string).trim(), currentStep, questionnaireVersion: "starix-gap-v1" });
    if (!result) return unavailable();
    return NextResponse.json({ ok: true, savedAt: result.updatedAt || new Date().toISOString() });
  } catch { return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 }); }
}
