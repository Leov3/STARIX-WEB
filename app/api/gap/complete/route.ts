import { NextResponse } from "next/server";
import { evaluateQualification, GAP_VERSION, isGapBranch, questionsForBranch, type GapAnswers } from "@/app/lib/gap";
import { forwardGap, isRateLimited, tokenFromRequest, unavailable } from "@/app/lib/gap-server";

export const runtime = "nodejs";
const temporaryBookingUrl = "https://odoo.starix.tech/appointment/starix-videollamada";

export async function POST(request: Request) {
  if (isRateLimited(request)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const token = tokenFromRequest(request, body);
  const branch = body.branch;
  const answers = body.answers;
  if (!token || !isGapBranch(branch) || !answers || typeof answers !== "object") return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  const typedAnswers = answers as GapAnswers;
  if (!questionsForBranch(branch).every((question) => typeof typedAnswers[question.id] === "string")) return NextResponse.json({ ok: false, error: "incomplete_answers" }, { status: 422 });
  const decision = evaluateQualification(branch, typedAnswers);
  if (decision.qualificationStatus === "PENDING") return NextResponse.json({ ok: false, error: "invalid_answers" }, { status: 422 });
  try {
    const result = await forwardGap("complete", { token, branch, answers: typedAnswers, questionnaireVersion: GAP_VERSION, ...decision });
    if (!result) return unavailable();
    const qualificationStatus = result.qualificationStatus;
    if (qualificationStatus !== "HIGH_PRIORITY" && qualificationStatus !== "MEDIUM_PRIORITY" && qualificationStatus !== "MANUAL_REVIEW") return NextResponse.json({ ok: false, error: "invalid_upstream_response" }, { status: 502 });
    return NextResponse.json({ ok: true, qualificationStatus, qualificationReason: result.qualificationReason || decision.qualificationReason, bookingUrl: qualificationStatus === "HIGH_PRIORITY" || qualificationStatus === "MEDIUM_PRIORITY" ? (typeof result.bookingUrl === "string" ? result.bookingUrl : temporaryBookingUrl) : undefined });
  } catch { return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 }); }
}
