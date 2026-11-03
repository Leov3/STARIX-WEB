const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  });
  const room = `StarixSmoke${Date.now()}`;
  const baseUrl = process.env.JITSI_BASE_URL || 'https://meet.starix.tech';
  const openParticipant = async (name) => {
    const context = await browser.newContext({ permissions: ['camera', 'microphone'], ignoreHTTPSErrors: true });
    await context.addInitScript(() => {
      window.__starixPeerConnections = [];
      const NativePeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = class extends NativePeerConnection {
        constructor(...args) {
          super(...args);
          window.__starixPeerConnections.push(this);
        }
      };
    });
    const page = await context.newPage();
    page.on('requestfailed', (request) => console.log(`request_failed_${name}=${request.url().slice(0, 160)} ${request.failure()?.errorText}`));
    page.on('console', (message) => {
      if (message.type() === 'error') console.log(`console_error_${name}=${message.text().slice(0, 180)}`);
    });
    await page.goto(`${baseUrl}/${room}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByPlaceholder('Enter your name').fill(name, { timeout: 20000 });
    await page.getByText('Join meeting', { exact: true }).last().click();
    return { context, page };
  };
  const first = await openParticipant('STARIX prueba A');
  await first.page.waitForTimeout(3000);
  const second = await openParticipant('STARIX prueba B');
  await second.page.waitForTimeout(12000);
  const stats = async (page) => page.evaluate(async () => {
    const connections = window.__starixPeerConnections || [];
    const reports = await Promise.all(connections.map((connection) => connection.getStats()));
    const rtp = reports.flatMap((report) => [...report.values()]).filter((item) => item.type === 'inbound-rtp' || item.type === 'outbound-rtp');
    return {
      connections: connections.length,
      states: connections.map((connection) => connection.connectionState),
      inboundAudioPackets: rtp.filter((item) => item.type === 'inbound-rtp' && item.kind === 'audio').reduce((sum, item) => sum + (item.packetsReceived || 0), 0),
      inboundVideoPackets: rtp.filter((item) => item.type === 'inbound-rtp' && item.kind === 'video').reduce((sum, item) => sum + (item.packetsReceived || 0), 0),
      outboundAudioPackets: rtp.filter((item) => item.type === 'outbound-rtp' && item.kind === 'audio').reduce((sum, item) => sum + (item.packetsSent || 0), 0),
      outboundVideoPackets: rtp.filter((item) => item.type === 'outbound-rtp' && item.kind === 'video').reduce((sum, item) => sum + (item.packetsSent || 0), 0),
    };
  });
  const firstStats = await stats(first.page);
  const secondStats = await stats(second.page);
  const firstSeesSecond = (await first.page.locator('body').innerText()).includes('STARIX prueba B');
  const secondSeesFirst = (await second.page.locator('body').innerText()).includes('STARIX prueba A');
  console.log(`room=${room}`);
  console.log(`first=${JSON.stringify(firstStats)}`);
  console.log(`second=${JSON.stringify(secondStats)}`);
  console.log(`first_sees_second=${firstSeesSecond}`);
  console.log(`second_sees_first=${secondSeesFirst}`);
  await first.page.screenshot({ path: '/work/jitsi-two-participants.png', fullPage: true });
  for (const result of [firstStats, secondStats]) {
    if (!result.states.includes('connected') || !result.inboundAudioPackets || !result.inboundVideoPackets || !result.outboundAudioPackets || !result.outboundVideoPackets) {
      throw new Error('Audio/video transport did not connect in both directions');
    }
  }
  if (!firstSeesSecond || !secondSeesFirst) throw new Error('Participants could not see each other');
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
