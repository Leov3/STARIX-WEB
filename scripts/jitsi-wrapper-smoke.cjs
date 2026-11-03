const { chromium } = require('playwright');
const { readFileSync } = require('node:fs');
const { createHmac } = require('node:crypto');

const secret = process.env.BOOKING_WEBHOOK_SECRET;
const baseUrl = process.env.STARIX_TEST_URL || 'http://127.0.0.1:3102';
const frameMatch = process.env.JITSI_FRAME_MATCH || '18443';
const bookingId = Number(process.env.JITSI_TEST_BOOKING_ID);
const userId = Number(process.env.JITSI_TEST_USER_ID);
if (!Number.isSafeInteger(bookingId) || !Number.isSafeInteger(userId)) throw new Error('Test booking and user ids required');
const code = readFileSync('/work/client-code', 'utf8').trim();
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const body = encode({ kind: 'staff-session', booking: bookingId, user: userId, exp: Math.floor(Date.now() / 1000) + 1800 });
const cookie = `${body}.${createHmac('sha256', secret).update(`staff:${body}`).digest('base64url')}`;

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const clientContext = await browser.newContext({ ignoreHTTPSErrors: true, permissions: ['camera', 'microphone'], viewport: { width: 1440, height: 900 } });
  const staffContext = await browser.newContext({ ignoreHTTPSErrors: true, permissions: ['camera', 'microphone'], viewport: { width: 1440, height: 900 } });
  await staffContext.addCookies([{ name: 'starix_meeting_staff', value: cookie, url: `${baseUrl}/api/jitsi/session`, httpOnly: true, secure: baseUrl.startsWith('https:'), sameSite: 'Lax' }]);
  const client = await clientContext.newPage();
  const staff = await staffContext.newPage();
  const errors = [];
  for (const [label, page] of [['client', client], ['staff', staff]]) page.on('pageerror', (error) => errors.push(`${label}:${error.message}`));
  await client.goto(`${baseUrl}/reunion?acceso=${code}`, { waitUntil: 'networkidle' });
  await client.getByRole('button', { name: /Entrar a la sala/i }).click();
  await client.waitForTimeout(7000);
  const clientFrame = client.frames().find((frame) => frame.url().includes(frameMatch));
  if (!clientFrame) throw new Error('Client iframe missing');
  await clientFrame.getByText('Pedir entrar', { exact: true }).first().click();
  await staff.goto(`${baseUrl}/reunion`, { waitUntil: 'networkidle' });
  await staff.getByRole('button', { name: /Entrar a la sala/i }).click();
  await staff.waitForTimeout(9000);
  const staffFrame = staff.frames().find((frame) => frame.url().includes(frameMatch));
  if (!staffFrame) throw new Error('Staff iframe missing');
  const waitingText = await clientFrame.locator('body').innerText();
  const staffText = await staffFrame.locator('body').innerText();
  if (!waitingText.includes('Podrás entrar tan pronto te acepten') || !staffText.includes('Admitir')) {
    await client.screenshot({ path: '/work/jitsi-wrapper-client-failed.png', fullPage: true });
    await staff.screenshot({ path: '/work/jitsi-wrapper-staff-failed.png', fullPage: true });
    console.log(JSON.stringify({ waitingText: waitingText.slice(0, 600), staffText: staffText.slice(0, 600), errors }));
    throw new Error('Lobby not shown in STARIX wrapper');
  }
  await staffFrame.getByText('Admitir', { exact: true }).first().click();
  await client.waitForTimeout(7000);
  const admitted = (await clientFrame.locator('body').innerText()).includes('Miniaturas de video');
  if (!admitted) throw new Error('Client was not admitted inside wrapper');
  await client.screenshot({ path: '/work/jitsi-wrapper-client.png', fullPage: true });
  await staff.screenshot({ path: '/work/jitsi-wrapper-staff.png', fullPage: true });
  console.log(JSON.stringify({ clientPrejoin: true, staffPrejoin: true, clientWaited: true, staffAdmitted: true, errors: errors.slice(0, 4) }));
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
