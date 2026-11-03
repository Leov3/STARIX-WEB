const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const context = await browser.newContext({ permissions: ['camera', 'microphone'], ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(`${process.env.JITSI_BASE_URL || 'https://meet.starix.tech'}/StarixNoToken${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="text"]').first().fill('Sin invitación');
  await page.getByText(/Join meeting|Unirse a la reunión|Entrar a la reunión|Unirse/i, { exact: true }).last().click();
  await page.waitForTimeout(6000);
  const text = await page.locator('body').innerText();
  const connected = text.includes('Miniaturas de video') && text.includes('Barra de herramientas');
  console.log(JSON.stringify({ withoutTokenConnected: connected, response: text.slice(0, 280) }));
  if (connected) throw new Error('Unauthenticated user joined a Jitsi room');
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
