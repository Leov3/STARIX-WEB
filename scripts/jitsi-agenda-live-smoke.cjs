const { chromium, devices } = require('playwright');
const { readFileSync } = require('node:fs');
const token = readFileSync('/work/gap-token', 'utf8').trim();
const baseUrl = process.env.STARIX_TEST_URL || 'https://starix.tech';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', devices['iPhone 13'].viewport]]) {
    const context = await browser.newContext({ viewport, ignoreHTTPSErrors: true, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/agenda`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((value) => sessionStorage.setItem('starix-diagnostic-session', JSON.stringify({ token: value })), token);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /Abrir videollamada/i }).waitFor({ timeout: 30000 });
    const link = await page.getByRole('link', { name: /Abrir videollamada/i }).getAttribute('href');
    await page.getByRole('button', { name: 'Copiar enlace' }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `/work/jitsi-agenda-live-${label}.png`, fullPage: true });
    if (!link?.startsWith('https://starix.tech/reunion?acceso=') || copied !== link) throw new Error(`${label}: private link missing or copy failed`);
    results.push({ label, confirmed: (await page.locator('h1').first().innerText()).includes('Nos vemos pronto'), privateLink: true, copied: true, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors });
    await context.close();
  }
  console.log(JSON.stringify(results));
  if (results.some((item) => !item.confirmed || item.overflow || item.errors.length)) throw new Error('Live agenda validation failed');
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
