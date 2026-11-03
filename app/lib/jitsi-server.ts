import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { BookingRef } from "@/app/lib/agenda-server";

const ODOO_ORIGIN = "https://odoo.starix.tech";
const APP_ID = process.env.JITSI_APP_ID || "starix-prod";
const MEET_DOMAIN = process.env.JITSI_MEET_DOMAIN || "meet.starix.tech";

function secret() {
  const value = process.env.BOOKING_WEBHOOK_SECRET;
  if (!value) throw new Error("booking_secret_missing");
  return value;
}

function signature(message: string) {
  return createHmac("sha256", secret()).update(message).digest("base64url");
}

export function clientMeetingCode(booking: BookingRef) {
  return `${booking.id}.${signature(`client:${booking.id}:${booking.accessToken}`)}`;
}

export function clientMeetingUrl(booking: BookingRef) {
  return `https://starix.tech/reunion?acceso=${encodeURIComponent(clientMeetingCode(booking))}`;
}

function secureEquals(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

type StaffClaims = { kind: "staff-entry" | "staff-session"; booking: number; user: number; exp: number };
export function verifyStaffTicket(ticket: string): StaffClaims | null {
  const parts = ticket.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]+$/.test(parts[1])) return null;
  if (!secureEquals(parts[1], signature(`staff:${parts[0]}`))) return null;
  try {
    const data = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as StaffClaims;
    if (!Number.isSafeInteger(data.booking) || !Number.isSafeInteger(data.user) || !Number.isSafeInteger(data.exp)) return null;
    if (data.kind !== "staff-entry" && data.kind !== "staff-session") return null;
    if (data.exp <= Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch { return null; }
}

export function staffSession(claims: StaffClaims) {
  const body = Buffer.from(JSON.stringify({ kind: "staff-session", booking: claims.booking, user: claims.user, exp: Math.floor(Date.now() / 1000) + 3 * 3600 })).toString("base64url");
  return `${body}.${signature(`staff:${body}`)}`;
}

export type MeetingAccess = {
  ok?: boolean; error?: string; role?: "client" | "staff"; room?: string;
  contactName?: string; staffName?: string; scheduledAt?: string;
};

export async function meetingAccess(input: { clientCode?: string; staffTicket?: string }): Promise<MeetingAccess | null> {
  const response = await fetch(`${ODOO_ORIGIN}/starix/api/meeting/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-starix-booking-secret": secret() },
    body: JSON.stringify(input),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 401 || response.status === 404 || response.status === 409) return null;
  if (!response.ok) throw new Error("odoo_meeting_access_failed");
  const data = await response.json() as MeetingAccess;
  return data.ok && data.room && data.role && data.scheduledAt ? data : null;
}

export function jitsiToken(access: MeetingAccess, displayName: string) {
  const appSecret = process.env.JITSI_APP_SECRET;
  if (!appSecret || !access.room || !access.role) throw new Error("jitsi_secret_missing");
  const now = Math.floor(Date.now() / 1000);
  const moderator = access.role === "staff";
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    aud: "jitsi", iss: APP_ID, sub: "meet.jitsi", room: access.room,
    iat: now, nbf: now - 5, exp: now + 2 * 3600, jti: randomUUID(),
    context: { user: { name: displayName.slice(0, 120), affiliation: moderator ? "owner" : "member", moderator, lobby_bypass: moderator } },
  })).toString("base64url");
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${createHmac("sha256", appSecret).update(unsigned).digest("base64url")}`;
}

export { MEET_DOMAIN };
