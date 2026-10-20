import { NextResponse } from "next/server";
import { forwardGap, tokenFromRequest } from "@/app/lib/gap-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const callbackSecret = request.headers.get("x-starix-booking-secret");
  if (!process.env.BOOKING_WEBHOOK_SECRET || callbackSecret !== process.env.BOOKING_WEBHOOK_SECRET) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const token = tokenFromRequest(request, body);
  const bookingId = typeof body.bookingId === "string" ? body.bookingId.trim().slice(0, 160) : "";
  if (!token || !bookingId) return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  try {
    const result = await forwardGap("booking_confirmed", { token, bookingId, scheduledAt: typeof body.scheduledAt === "string" ? body.scheduledAt.slice(0, 80) : undefined });
    if (!result) return NextResponse.json({ ok: false, error: "gap_service_unavailable" }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 }); }
}
