import { NextResponse } from "next/server";
import { askOdoo, bookingForSession } from "@/app/lib/agenda-server";
import { isRateLimited, tokenFromRequest } from "@/app/lib/gap-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isRateLimited(request)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const token = tokenFromRequest(request, body);
  const month = body.month;
  if (!token) return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 });
  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ ok: false, error: "invalid_month" }, { status: 400 });
  try {
    const booking = await bookingForSession(token);
    if (!booking) return NextResponse.json({ ok: false, error: "booking_unavailable" }, { status: 409 });
    const result = await askOdoo(booking, "slots", { month });
    if (!result.data.ok) return NextResponse.json({ ok: false, error: result.data.error || "booking_unavailable" }, { status: result.status === 409 ? 409 : 502 });
    return NextResponse.json({
      ok: true,
      status: result.data.status,
      contactName: booking.contactName,
      timezone: "America/Bogota",
      durationMinutes: result.data.durationMinutes,
      slots: result.data.slots || [],
      scheduledAt: result.data.scheduledAt,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ ok: false, error: "agenda_unavailable" }, { status: 502 }); }
}
