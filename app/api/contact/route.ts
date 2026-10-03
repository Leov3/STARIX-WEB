import { NextResponse } from "next/server";

const allowedInterests = new Set([
  "product_platform",
  "automation",
  "brand_digital_presence",
  "unsure",
]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readText = (value: unknown, limit: number) =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const name = readText(data.name, 120);
  const email = readText(data.email, 254).toLowerCase();
  const phone = readText(data.phone, 48);
  const countryCode = readText(data.countryCode, 8);
  const company = readText(data.company, 160);
  const interest = readText(data.interest, 64);
  const page = readText(data.page, 240) || "/";
  const consent = data.consent === true;

  if (
    name.length < 2 ||
    !emailPattern.test(email) ||
    phone.length < 7 ||
    !allowedInterests.has(interest) ||
    !consent
  ) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 422 });
  }

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, error: "contact_service_unavailable" }, { status: 503 });
  }

  const payload = {
    name,
    email,
    phone,
    countryCode,
    whatsapp: `${countryCode}${phone}`.replace(/\s+/g, " ").trim(),
    company,
    interest,
    consent,
    source: "starix_web",
    page,
    submittedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "upstream_error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 });
  }
}
