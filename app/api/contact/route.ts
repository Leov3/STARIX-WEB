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
  const meetingDate = readText(data.meetingDate, 10);
  const meetingTime = readText(data.meetingTime, 5);
  const timezone = readText(data.timezone, 100);
  const projectContext = readText(data.projectContext, 1_000);
  const gapData = data.gap && typeof data.gap === "object" ? data.gap as Record<string, unknown> : null;
  const gapGoal = readText(gapData?.goal, 1_000);
  const gapChallenge = readText(gapData?.challenge, 1_000);
  const gapTimeline = readText(gapData?.timeline, 64);
  const gapTeamSize = readText(gapData?.teamSize, 64);
  const consent = data.consent === true;
  const hasMeetingRequest = Boolean(meetingDate || meetingTime);
  const hasGap = Boolean(gapData);

  if (
    name.length < 2 ||
    !emailPattern.test(email) ||
    phone.length < 7 ||
    !allowedInterests.has(interest) ||
    !consent ||
    (hasMeetingRequest && (!/^\d{4}-\d{2}-\d{2}$/.test(meetingDate) || !/^\d{2}:\d{2}$/.test(meetingTime) || projectContext.length < 10)) ||
    (hasGap && (gapGoal.length < 10 || gapChallenge.length < 10 || !gapTimeline || !gapTeamSize))
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
    meetingRequest: hasMeetingRequest ? { date: meetingDate, time: meetingTime, timezone, projectContext } : undefined,
    gap: hasGap ? { goal: gapGoal, challenge: gapChallenge, timeline: gapTimeline, teamSize: gapTeamSize } : undefined,
    submittedAt: new Date().toISOString(),
  };

  try {
    const contactSecret = process.env.CONTACT_WEBHOOK_SECRET;
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(contactSecret ? { "x-starix-contact-secret": contactSecret } : {}) },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    let upstream: unknown;
    try {
      upstream = await response.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: response.ok ? "invalid_upstream_response" : "upstream_error" },
        { status: response.ok ? 502 : response.status },
      );
    }

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "upstream_error" }, { status: response.status });
    }
    if (!upstream || typeof upstream !== "object" || Array.isArray(upstream)) {
      return NextResponse.json({ ok: false, error: "invalid_upstream_response" }, { status: 502 });
    }

    return NextResponse.json(upstream, { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 });
  }
}
