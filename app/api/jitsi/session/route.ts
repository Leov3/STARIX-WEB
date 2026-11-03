import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/app/lib/gap-server";
import { jitsiToken, MEET_DOMAIN, meetingAccess, verifyStaffTicket } from "@/app/lib/jitsi-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (isRateLimited(request)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  let input: { clientCode?: unknown; name?: unknown };
  try { input = await request.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const clientCode = typeof input.clientCode === "string" && /^\d+\.[A-Za-z0-9_-]{43}$/.test(input.clientCode) ? input.clientCode : "";
  const cookie = request.cookies.get("starix_meeting_staff")?.value || "";
  const staff = verifyStaffTicket(cookie);
  if (!clientCode && (!staff || staff.kind !== "staff-session")) return NextResponse.json({ ok: false, error: "invalid_access" }, { status: 401 });
  try {
    const access = await meetingAccess(clientCode ? { clientCode } : { staffTicket: cookie });
    if (!access) return NextResponse.json({ ok: false, error: "invalid_access" }, { status: 401 });
    const suppliedName = typeof input.name === "string" ? input.name.trim().slice(0, 120) : "";
    const name = access.role === "staff" ? (access.staffName || "Colaborador STARIX") : (suppliedName || access.contactName || "Invitado STARIX");
    return NextResponse.json({
      ok: true, role: access.role, room: access.room, contactName: access.contactName,
      scheduledAt: access.scheduledAt, name, jwt: jitsiToken(access, name), domain: MEET_DOMAIN,
    }, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch { return NextResponse.json({ ok: false, error: "meeting_unavailable" }, { status: 502 }); }
}
