import { chromium } from 'playwright';
import { createInterface } from 'node:readline/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { stdin, stdout } from 'node:process';

const target = process.argv[2];
let parsed;
try {
  parsed = new URL(target);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
} catch {
  console.error('Usage: npm run inspect -- "https://example.com/watch"');
  process.exit(1);
}
function classify(url, contentType = '') {
  let path;
  try { path = new URL(url).pathname.toLowerCase(); } catch { return null; }
  const mime = contentType.split(';')[0].trim().toLowerCase();
  if (path.endsWith('.m3u8') || ['application/vnd.apple.mpegurl','application/x-mpegurl','audio/mpegurl','audio/x-mpegurl'].includes(mime)) return 'HLS';
  if (path.endsWith('.mpd') || mime === 'application/dash+xml') return 'DASH';
  if (path.endsWith('.vtt') || mime === 'text/vtt') return 'VTT';
  if (path.endsWith('.srt') || mime === 'application/x-subrip') return 'SRT';
  if (path.endsWith('.mp4') || mime === 'video/mp4') return 'MP4';
  return null;
}
const found = new Map();
function record(type, url) {
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return;
    const key = type + ':' + u.href;
    if (found.has(key) || found.size >= 500) return;
    found.set(key, { type, url: u.href });
    console.log('['+type+'] '+u.origin+u.pathname+(u.search?' [query hidden]':''));
  } catch { /* Ignore non-HTTP URLs. */ }
}
const rl = createInterface({ input: stdin, output: stdout });
let browser;
try {
  const answer = await rl.question('Inspect only media you own or are permitted to use. Continue? [y/N] ');
  if (answer.trim().toLowerCase() !== 'y') process.exitCode = 1;
  else {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    context.on('response', response => {
      if (response.status() < 200 || response.status() >= 300) return;
      const type = classify(response.url(), response.headers()['content-type'] ?? '');
      if (type) record(type, response.url());
    });
    context.on('page', page => page.on('framenavigated', frame => {
      if (frame.parentFrame()) record('IFRAME', frame.url());
    }));
    const page = await context.newPage();
    try { await page.goto(parsed.href, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
    catch (e) { console.warn('Navigation:', e.message); }
    await rl.question('Start authorized playback normally. Press Enter here to save the observations. ');
    for (const p of context.pages()) {
      for (const frame of p.frames()) {
        if (frame.parentFrame()) record('IFRAME', frame.url());
        try {
          const urls = await frame.locator('video, audio, source, track').evaluateAll(nodes =>
            nodes.flatMap(n => [n.currentSrc, n.src].filter(Boolean)));
          for (const url of urls) { const type = classify(url); if (type) record(type, url); }
        } catch { /* Frame may have navigated. */ }
      }
    }
    await mkdir('.cinema', { recursive: true, mode: 0o700 });
    await writeFile('.cinema/sources.json', JSON.stringify({ sources:[...found.values()] }, null, 2)+'\n', {mode:0o600});
    console.log('Saved '+found.size+' observations to .cinema/sources.json');
    console.log('Import the report in Cinema > Media tools. Do not share reports; URLs can contain private tokens.');
  }
} finally { rl.close(); await browser?.close(); }
