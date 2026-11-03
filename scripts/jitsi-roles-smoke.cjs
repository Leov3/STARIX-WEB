const { chromium } = require('playwright');
const { createHmac } = require('node:crypto');

const baseUrl = process.env.JITSI_BASE_URL || 'https://127.0.0.1:18443';
const secret = process.env.JWT_APP_SECRET;
if (!secret) throw new Error('JWT_APP_SECRET missing');
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
function token(room, name, moderator) {
  const now = Math.floor(Date.now() / 1000);
  const input = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    aud: 'jitsi', iss: 'starix-stage', sub: 'meet.jitsi', room,
    iat: now, nbf: now - 5, exp: now + 1800,
    context: { user: { name, affiliation: moderator ? 'owner' : 'member', moderator, lobby: !moderator, lobby_bypass: moderator } },
  })}`;
  return `${input}.${createHmac('sha256', secret).update(input).digest('base64url')}`;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const results = [];
  async function open(room, name, moderator) {
    const context = await browser.newContext({ permissions: ['camera', 'microphone'], ignoreHTTPSErrors: true });
    const page = await context.newPage();
    page.on('pageerror', (error) => console.log(`${name} pageerror ${error.message.slice(0, 160)}`));
    await page.goto(`${baseUrl}/${room}?jwt=${token(room, name, moderator)}`, { waitUntil: 'domcontentloaded' });
    const join = page.getByText(/Join meeting|Unirse a la reunión|Entrar a la reunión|Unirse/i, { exact: true });
    await join.last().click({ timeout: 30000 });
    return { context, page };
  }
  for (const order of ['client-first', 'staff-first']) {
    const room = `StarixRoles${Date.now()}${order.replace('-', '')}`;
    const first = order === 'client-first' ? await open(room, 'Cliente STARIX', false) : await open(room, 'Colaborador STARIX', true);
    await first.page.waitForTimeout(5000);
    const before = (await first.page.locator('body').innerText()).slice(0, 1200);
    await first.page.screenshot({ path: `/work/jitsi-${order}-before.png`, fullPage: true });
    const second = order === 'client-first' ? await open(room, 'Colaborador STARIX', true) : await open(room, 'Cliente STARIX', false);
    await second.page.waitForTimeout(9000);
    const staff = order === 'client-first' ? second : first;
    const client = order === 'client-first' ? first : second;
    if (!(await client.page.locator('body').innerText()).includes('Podrás entrar tan pronto te acepten')) throw new Error(`${order}: client bypassed lobby`);
    await staff.page.getByText('Admitir', { exact: true }).first().click();
    await client.page.waitForTimeout(5000);
    if (!(await client.page.locator('body').innerText()).includes('Colaborador STARIX')) throw new Error(`${order}: client was not admitted`);
    const third = await open(room, 'Segundo cliente STARIX', false);
    await third.page.waitForTimeout(4000);
    const staffCanAdmit = await staff.page.getByText('Admitir', { exact: true }).count();
    const clientCanAdmit = await client.page.getByText('Admitir', { exact: true }).count();
    if (!staffCanAdmit || clientCanAdmit) throw new Error(`${order}: incorrect moderator controls`);
    const snapshots = [];
    for (const [name, actor] of [['first', first], ['second', second]]) {
      const data = await actor.page.evaluate(() => ({
        text: document.body.innerText.slice(0, 1400),
        isModerator: typeof window.APP?.conference?.isModerator === 'function' ? window.APP.conference.isModerator() : null,
        role: typeof window.APP?.conference?.getParticipantRole === 'function' ? window.APP.conference.getParticipantRole() : null,
      }));
      await actor.page.screenshot({ path: `/work/jitsi-${order}-${name}.png`, fullPage: true });
      snapshots.push({ name, ...data });
    }
    results.push({ order, before, staffCanAdmit, clientCanAdmit, snapshots });
    await first.context.close(); await second.context.close(); await third.context.close();
  }
  console.log(JSON.stringify(results));
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
