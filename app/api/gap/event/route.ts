import { NextResponse } from "next/server";
import { forwardGap, isRateLimited, tokenFromRequest, unavailable } from "@/app/lib/gap-server";

const events = new Set(["thankyou_viewed", "gap_started", "gap_question_completed", "gap_completed", "gap_qualified", "gap_manual_review", "booking_started", "booking_completed"]);
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isRateLimited(request)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const token = tokenFromRequest(request, body);
  const event = body.event;
  if (!token || typeof event !== "string" || !events.has(event)) return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  try {
    const result = await forwardGap("event", { token, event, questionId: typeof body.questionId === "string" ? body.questionId.slice(0, 80) : undefined });
    if (!result) return unavailable();
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 }); }
}
