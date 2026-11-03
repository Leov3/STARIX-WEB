const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', devices['iPhone 13'].viewport]]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:3101/reunion?preview=1', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `/work/jitsi-page-${label}.png`, fullPage: true });
    results.push({ label, title: await page.title(), heading: await page.locator('h1').first().textContent(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), errors });
    await context.close();
  }
  console.log(JSON.stringify(results));
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
