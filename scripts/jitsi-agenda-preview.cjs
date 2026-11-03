const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', devices['iPhone 13'].viewport]]) {
    const context = await browser.newContext({ viewport, ignoreHTTPSErrors: true, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:3102/agenda?preview=1', { waitUntil: 'networkidle' });
    await page.locator('.agenda-days button').first().click();
    await page.locator('.agenda-times button').first().click();
    await page.getByRole('button', { name: /Confirmar videollamada/i }).click();
    await page.getByRole('button', { name: 'Copiar enlace' }).click();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `/work/jitsi-agenda-${label}.png`, fullPage: true });
    results.push({ label, heading: await page.locator('h1').first().textContent(), link: await page.getByRole('link', { name: /Abrir videollamada/i }).getAttribute('href'), copied: clipboard.endsWith('/reunion?preview=1'), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors });
    await context.close();
  }
  console.log(JSON.stringify(results));
  if (results.some((item) => !item.copied || item.overflow || item.errors.length)) throw new Error('Agenda preview validation failed');
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
