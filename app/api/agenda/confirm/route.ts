import { NextResponse } from "next/server";
import { askOdoo, bookingForSession } from "@/app/lib/agenda-server";
import { isRateLimited, tokenFromRequest } from "@/app/lib/gap-server";
import { clientMeetingUrl } from "@/app/lib/jitsi-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isRateLimited(request)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const token = tokenFromRequest(request, body);
  const when = body.when;
  if (!token) return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 });
  if (typeof when !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(when)) return NextResponse.json({ ok: false, error: "invalid_slot" }, { status: 400 });
  try {
    const booking = await bookingForSession(token);
    if (!booking) return NextResponse.json({ ok: false, error: "booking_unavailable" }, { status: 409 });
    const result = await askOdoo(booking, "confirm", { when });
    if (!result.data.ok) return NextResponse.json({ ok: false, error: result.data.error || "booking_failed" }, { status: result.status === 400 || result.status === 409 ? result.status : 502 });
    return NextResponse.json({
      ok: true, status: result.data.status, contactName: booking.contactName,
      scheduledAt: result.data.scheduledAt,
      meetingUrl: clientMeetingUrl(booking),
      durationMinutes: result.data.durationMinutes,
      timezone: "America/Bogota",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ ok: false, error: "agenda_unavailable" }, { status: 502 }); }
}
