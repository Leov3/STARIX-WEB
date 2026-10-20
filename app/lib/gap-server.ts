import { NextResponse } from "next/server";

const MAX_REQUESTS = 50;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
}

export function isRateLimited(request: Request) {
  const now = Date.now();
  const key = clientAddress(request);
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}

export const unavailable = () => NextResponse.json({ ok: false, error: "gap_service_unavailable" }, { status: 503 });

export async function forwardGap(action: string, payload: Record<string, unknown>) {
  const webhookUrl = process.env.GAP_WEBHOOK_URL;
  if (!webhookUrl) return null;
  const secret = process.env.GAP_WEBHOOK_SECRET;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(secret ? { "x-starix-gap-secret": secret } : {}) },
    body: JSON.stringify({ action, ...payload }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("gap_upstream_error");
  return response.json() as Promise<Record<string, unknown>>;
}

export function tokenFromRequest(request: Request, body: Record<string, unknown>) {
  const header = request.headers.get("x-starix-gap-token");
  const value = header || body.token;
  return typeof value === "string" && /^[A-Za-z0-9_-]{32,512}$/.test(value) ? value : null;
}
