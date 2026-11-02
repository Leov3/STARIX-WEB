import { NextResponse } from "next/server";
import { forwardGap } from "@/app/lib/gap-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const callbackSecret = request.headers.get("x-starix-booking-secret");
  if (!process.env.BOOKING_WEBHOOK_SECRET || callbackSecret !== process.env.BOOKING_WEBHOOK_SECRET) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const bookingId = typeof body.bookingId === "string" ? body.bookingId.trim().slice(0, 160) : "";
  const scheduledAt = typeof body.scheduledAt === "string" ? body.scheduledAt.trim().slice(0, 80) : undefined;
  if (!bookingId) return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  try {
    // The Odoo booking callback only identifies the reservation. Its shared secret
    // is verified above; n8n resolves the linked lead internally by booking ID.
    const result = await forwardGap("booking_confirmed", { bookingId, scheduledAt });
    if (!result) return NextResponse.json({ ok: false, error: "gap_service_unavailable" }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 }); }
}
