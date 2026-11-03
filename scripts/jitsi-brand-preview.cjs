const { chromium } = require('playwright');
const { createHmac } = require('node:crypto');
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const body = { aud: 'jitsi', iss: 'starix-stage', sub: 'meet.jitsi', room: 'StarixBrandPreview', iat: now, exp: now + 600, context: { user: { name: 'María STARIX', affiliation: 'owner', moderator: true, lobby_bypass: true } } };
const unsigned = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(body)}`;
const token = `${unsigned}.${createHmac('sha256', process.env.JWT_APP_SECRET).update(unsigned).digest('base64url')}`;
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 }, permissions: ['camera', 'microphone'] });
  const brandingRequests = [];
  page.on('request', (request) => { if (request.url().includes('branding')) brandingRequests.push(request.url()); });
  page.on('response', (response) => { if (response.url().includes('branding')) console.log(`branding_status=${response.status()}`); });
  await page.goto(`https://127.0.0.1:18443/StarixBrandPreview?jwt=${token}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/work/jitsi-brand-preview.png', fullPage: true });
  console.log(JSON.stringify({ brandingRequests, heading: (await page.locator('body').innerText()).slice(0, 500) }));
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
