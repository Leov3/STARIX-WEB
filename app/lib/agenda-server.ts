import { forwardGap } from "@/app/lib/gap-server";

const ODOO_ORIGIN = "https://odoo.starix.tech";

export type BookingRef = { id: string; accessToken: string };
export type AgendaResponse = {
  ok?: boolean;
  error?: string;
  status?: "pending" | "confirmed";
  timezone?: string;
  durationMinutes?: number;
  slots?: string[];
  scheduledAt?: string;
};

export async function bookingForSession(token: string): Promise<BookingRef | null> {
  const session = await forwardGap("session", { token });
  if (!session || (session.qualificationStatus !== "HIGH_PRIORITY" && session.qualificationStatus !== "MEDIUM_PRIORITY")) return null;
  if (typeof session.bookingUrl !== "string") return null;
  try {
    const url = new URL(session.bookingUrl, ODOO_ORIGIN);
    const match = /^\/my\/bookings\/(\d+)\/schedule(?:\/\d{4}\/\d{1,2})?\/?$/.exec(url.pathname);
    const accessToken = url.searchParams.get("access_token");
    if (url.origin !== ODOO_ORIGIN || !match || !accessToken) return null;
    return { id: match[1], accessToken };
  } catch {
    return null;
  }
}

export async function askOdoo(ref: BookingRef, action: "slots" | "confirm", payload: Record<string, string>): Promise<{ status: number; data: AgendaResponse }> {
  const secret = process.env.BOOKING_WEBHOOK_SECRET;
  if (!secret) throw new Error("booking_secret_missing");
  const response = await fetch(`${ODOO_ORIGIN}/starix/api/bookings/${ref.id}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-starix-booking-secret": secret },
    body: JSON.stringify({ access_token: ref.accessToken, ...payload }),
    cache: "no-store",
    signal: AbortSignal.timeout(action === "confirm" ? 30_000 : 15_000),
  });
  const data = await response.json() as AgendaResponse;
  return { status: response.status, data };
}
