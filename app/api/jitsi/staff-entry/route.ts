import { NextRequest, NextResponse } from "next/server";
import { meetingAccess, staffSession, verifyStaffTicket } from "@/app/lib/jitsi-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get("ticket") || "";
  const claims = verifyStaffTicket(ticket);
  if (!claims || claims.kind !== "staff-entry") return NextResponse.redirect(new URL("/reunion", request.url));
  try {
    const access = await meetingAccess({ staffTicket: ticket });
    if (!access || access.role !== "staff") return NextResponse.redirect(new URL("/reunion", request.url));
    const response = NextResponse.redirect(new URL("/reunion", request.url));
    response.cookies.set("starix_meeting_staff", staffSession(claims), {
      httpOnly: true, secure: true, sameSite: "lax", path: "/api/jitsi", maxAge: 3 * 3600,
    });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch { return NextResponse.redirect(new URL("/reunion", request.url)); }
}
