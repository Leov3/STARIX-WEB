import { NextResponse } from "next/server";
import { isGapBranch } from "@/app/lib/gap";
import { forwardGap, isRateLimited, tokenFromRequest, unavailable } from "@/app/lib/gap-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isRateLimited(request)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const token = tokenFromRequest(request, body);
  if (!token) return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 });
  try {
    const result = await forwardGap("session", { token });
    if (!result) return unavailable();
    if (!isGapBranch(result.branch) || !result.answers || typeof result.answers !== "object") return NextResponse.json({ ok: false, error: "invalid_upstream_response" }, { status: 502 });
    return NextResponse.json({ ok: true, branch: result.branch, answers: result.answers, currentStep: Number(result.currentStep) || 0, status: result.status, qualificationStatus: result.qualificationStatus });
  } catch { return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 }); }
}
