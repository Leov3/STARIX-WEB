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
  const secret = process.env.BOOKING_WEBHOOK_SECRET;
  if (!secret) throw new Error("booking_secret_missing");
  const response = await fetch(`${ODOO_ORIGIN}/starix/api/agenda/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-starix-booking-secret": secret },
    body: JSON.stringify({ token }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 409 || response.status === 401) return null;
  if (!response.ok) throw new Error("booking_lookup_failed");
  const data = await response.json() as { ok?: boolean; bookingId?: number; accessToken?: string };
  if (!data.ok || !Number.isSafeInteger(data.bookingId) || !data.accessToken) return null;
  return { id: String(data.bookingId), accessToken: data.accessToken };
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
