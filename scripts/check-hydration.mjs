// Proves the prerendered page hydrates cleanly and behaves correctly in a
// real browser. Adapted from china-guy's check-hydration.mjs and
// check-functional.mjs for this single-page site.
//
// A prerendered page that disagrees with the client tree looks fine in a
// screenshot — React silently patches it up — but the patch costs a frame, and
// anything React cannot reconcile is thrown away. So the page is loaded twice:
//
//   1. With JavaScript disabled, to see exactly what the server wrote: the
//      whole page must already be there (crawlers and no-JS visitors get only
//      this), with its SEO head and every srcset variant on disk.
//   2. Normally. The hydrated tree must equal the server markup, nothing may
//      log an error or warning, and no request may fail. Then the behaviour
//      no screenshot can see: the Stories filter, the lightbox and its keys,
//      the currency toggle, the inquiry drawer and its form — validation, a
//      successful POST and a failed one — and no sideways scroll on phones.
//
// The inquiry form POSTs to a hosted collector (FORM_ENDPOINT) and every
// request there lands in a real inbox. This script therefore mocks that URL
// with page.route() wherever it submits, aborts every other off-origin
// request, and launches Chrome with the collector's host mapped to NOTFOUND,
// so a fake inquiry can never leave the machine.
//
//   npm run build && npm run check:hydration
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 4630;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const SECTIONS = ['stories', 'destinations', 'experience', 'investment'];
const MIN_GALLERY = 30;
const FORM_TYPE = 'wael-mansouri-inquiry';

// Read from source rather than duplicated, so the check follows the site. A
// build with VITE_FORM_ENDPOINT set bakes in that URL instead; honour it too.
const siteTs = fs.readFileSync(path.join(ROOT, 'src/lib/site.ts'), 'utf8');
const FORM_ENDPOINT =
  process.env.VITE_FORM_ENDPOINT || siteTs.match(/FORM_ENDPOINT\s*=.*?\|\|\s*'([^']+)'/)?.[1];
const SITE_URL = (process.env.VITE_SITE_URL || siteTs.match(/DEFAULT_SITE_URL\s*=\s*'([^']+)'/)?.[1])?.replace(/\/+$/, '');
if (!FORM_ENDPOINT || !SITE_URL) throw new Error('could not read FORM_ENDPOINT / SITE_URL from src/lib/site.ts');
const FORM_HOST = new URL(FORM_ENDPOINT).hostname;

const indexHtml = fs.existsSync(path.join(DIST, 'index.html')) ? fs.readFileSync(path.join(DIST, 'index.html'), 'utf8') : '';
if (!indexHtml.includes('<main')) {
  throw new Error('dist/index.html is not prerendered — run `npm run build`, not `build:spa`');
}

// ─── Harness ────────────────────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

/** Serves dist/ like GitHub Pages: real files only, a 404 for anything else. */
function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(DIST, url);
    if (!file.startsWith(DIST)) return res.writeHead(403).end();
    if (url.endsWith('/')) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end('not found');
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

/**
 * Playwright's own Chromium (what CI installs), falling back to a system
 * Chrome when the local browser cache predates the package. CHROME_PATH
 * overrides both.
 */
async function launch() {
  const args = [`--host-resolver-rules=MAP ${FORM_HOST} ~NOTFOUND, MAP *.${FORM_HOST} ~NOTFOUND`];
  if (process.env.CHROME_PATH) return chromium.launch({ executablePath: process.env.CHROME_PATH, args });
  try {
    return await chromium.launch({ args });
  } catch (err) {
    const found = ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'].find(
      (p) => fs.existsSync(p),
    );
    if (!found) throw new Error(`No browser: ${err.message.split('\n')[0]}\n  Run \`npx playwright install chromium\`.`);
    console.error(`  (using system Chrome at ${found})`);
    return chromium.launch({ executablePath: found, args });
  }
}

const isLocal = (u) => String(u).startsWith(ORIGIN) || /^(data|blob|about):/.test(String(u));
const isForm = (u) => {
  try {
    const h = new URL(String(u)).hostname;
    return h === FORM_HOST || h.endsWith(`.${FORM_HOST}`);
  } catch {
    return false;
  }
};

/**
 * A context that aborts every off-origin request — the site self-hosts its
 * fonts and images, so any such request is a bug — and records it. A page
 * that submits the form overrides the collector's URL with its own
 * page.route(), which Playwright gives precedence over this one.
 */
async function context(b, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, ...opts });
  ctx.offOrigin = [];
  await ctx.route(
    (u) => !isLocal(u),
    (route) => {
      const r = route.request();
      ctx.offOrigin.push(`${r.method()} ${r.url()}`);
      if (isForm(r.url())) console.error(`  BLOCKED unmocked ${r.method()} ${r.url()}`);
      return route.abort('blockedbyclient');
    },
  );
  return ctx;
}

/** Everything that went wrong on a page while it was open. */
function watch(page) {
  const problems = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    // The deliberate 'connectionfailed' / form aborts are counted by the test
    // that causes them; anything else (a missing file, a reset) is a bug.
    if (isForm(r.url())) return;
    problems.push(`request failed: ${r.url()} (${r.failure()?.errorText})`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !isForm(r.url())) problems.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  return problems;
}

/** React attaches its fiber to every hydrated node; wait until it has. */
const hydrated = (page) =>
  page.waitForFunction(() => {
    const el = document.querySelector('#stories button');
    return !!el && Object.keys(el).some((k) => k.startsWith('__reactFiber'));
  });

/**
 * Values a component deliberately changes in an effect right after hydrating,
 * so they legitimately differ from the build-time markup. Each is masked on
 * both sides before comparing. Keep this list short and explained.
 *
 *  - GoldenHour (Hero): the server writes a fixed '18:20'; the client swaps in
 *    this month's Tunis golden hour, which the build cannot know.
 */
const CLIENT_ONLY = [[/(tabular-nums">)\d{2}:\d{2}(<\/p><p[^>]*>Golden hour tonight)/, '$1HH:MM$2']];

/** Whitespace and comments between elements are not observable. */
const normalise = (html) =>
  CLIENT_ONLY.reduce((h, [re, to]) => h.replace(re, to), html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/ ?([:;]) ?/g, '$1')
    .replace(/;"/g, '"')
    .replace(/> </g, '><')
    .trim();

let failures = 0;
async function check(name, fn) {
  try {
    const detail = await fn();
    console.log(`  ok    ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL  ${name}`);
    for (const line of String(err?.message ?? err).split('\n').slice(0, 12)) console.log(`          ${line}`);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const none = (list, label) => {
  const uniq = [...new Set(list)];
  assert(uniq.length === 0, `${uniq.length} ${label}:\n${uniq.slice(0, 10).join('\n')}`);
};

/** Scroll top to bottom so every lazy image is requested, then back. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
}

// ─── Run ────────────────────────────────────────────────────────────────────

const server = await serve();
const b = await launch();
console.log(`Checking ${ORIGIN}/ (dist/), form endpoint ${FORM_ENDPOINT} mocked\n`);

// 1 — the server markup, JavaScript disabled.
let serverHtml = '';
{
  const ctx = await context(b, { javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' });
  serverHtml = await page.evaluate(() => document.getElementById('root').innerHTML);

  await check('no-JS: one h1 and every section', async () => {
    const h1 = await page.locator('h1').allInnerTexts();
    assert(h1.length === 1 && h1[0].trim(), `expected one non-empty h1, got ${JSON.stringify(h1)}`);
    for (const id of SECTIONS) assert((await page.locator(`section#${id}`).count()) === 1, `section#${id} missing`);
    return `h1 "${h1[0].replace(/\s+/g, ' ').trim()}", #${SECTIONS.join(' #')}`;
  });

  await check(`no-JS: Stories gallery has >= ${MIN_GALLERY} images with srcset`, async () => {
    const n = await page.locator('#stories figure img[srcset]').count();
    assert(n >= MIN_GALLERY, `only ${n} gallery images`);
    return `${n} images`;
  });

  await check('no-JS: JSON-LD parses', async () => {
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    assert(blocks.length >= 1, 'no JSON-LD');
    const types = blocks.map((t) => JSON.parse(t)).map((j) => j['@type'] ?? (j['@graph'] ?? []).map((g) => g['@type']).join('+'));
    return `${blocks.length} block(s): ${types.join(', ')}`;
  });

  await check('no-JS: title, description, canonical and Open Graph tags', async () => {
    const head = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      og: Object.fromEntries([...document.querySelectorAll('meta[property^="og:"]')].map((m) => [m.getAttribute('property'), m.content])),
      twitter: document.querySelector('meta[name="twitter:card"]')?.content,
    }));
    assert(head.title, 'no <title>');
    assert(head.desc, 'no meta description');
    assert(head.canonical === `${SITE_URL}/`, `canonical is ${head.canonical}, expected ${SITE_URL}/`);
    for (const k of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) assert(head.og[k], `${k} missing`);
    assert(head.og['og:url'] === `${SITE_URL}/`, `og:url is ${head.og['og:url']}`);
    const og = new URL(head.og['og:image']);
    assert(og.origin === SITE_URL, `og:image ${og.href} is not on ${SITE_URL}`);
    assert(fs.existsSync(path.join(DIST, og.pathname)), `og:image ${og.pathname} is not in dist/`);
    assert(head.twitter === 'summary_large_image', `twitter:card is ${head.twitter}`);
    return `canonical ${head.canonical}, ${Object.keys(head.og).length} og: tags`;
  });

  await check('no-JS: every src/srcset/icon/manifest file the HTML names exists in dist/', async () => {
    const urls = await page.evaluate(() => {
      const out = [];
      for (const i of document.querySelectorAll('img')) {
        out.push(i.getAttribute('src'));
        for (const part of (i.getAttribute('srcset') || '').split(',')) if (part.trim()) out.push(part.trim().split(/\s+/)[0]);
      }
      for (const l of document.querySelectorAll('link[href]')) if (!/^(canonical)$/.test(l.rel)) out.push(l.getAttribute('href'));
      for (const s of document.querySelectorAll('script[src]')) out.push(s.getAttribute('src'));
      return out;
    });
    const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'site.webmanifest'), 'utf8'));
    urls.push(...manifest.icons.map((i) => i.src));
    const local = [...new Set(urls.filter((u) => u && u.startsWith('/')))];
    const missing = local.filter((u) => !fs.existsSync(path.join(DIST, decodeURIComponent(u.split('?')[0]))));
    none(missing, 'referenced files missing from dist/');
    return `${local.length} distinct files`;
  });

  await ctx.close();
}

// 2 — hydrated, with JavaScript.
const ctx = await context(b);
{
  const page = await ctx.newPage();
  const problems = watch(page);
  await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
  await hydrated(page);

  await check('hydrated tree equals the server markup', async () => {
    const clientHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
    const a = normalise(serverHtml);
    const c = normalise(clientHtml);
    if (a === c) return `${(a.length / 1024).toFixed(1)} KB`;
    let i = 0;
    while (i < a.length && i < c.length && a[i] === c[i]) i++;
    throw new Error(`first divergence at char ${i}:\n  server: …${a.slice(Math.max(0, i - 60), i + 90)}\n  client: …${c.slice(Math.max(0, i - 60), i + 90)}`);
  });

  await check('every lazy image, font, icon and the manifest loads', async () => {
    await scrollThrough(page);
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/['"]/g, '')))];
    });
    for (const f of ['Cormorant Garamond', 'Plus Jakarta Sans']) assert(fonts.includes(f), `font ${f} never loaded (loaded: ${fonts.join(', ') || 'none'})`);
    // The browser fetches the manifest and icons lazily; request them the way it would.
    for (const u of ['/site.webmanifest', '/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png']) {
      const r = await page.request.get(`${ORIGIN}${u}`);
      assert(r.ok(), `${u} → HTTP ${r.status()}`);
    }
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
    );
    none(broken, 'images that failed to decode');
    return `fonts: ${fonts.join(', ')}`;
  });

  await check('Stories filter buttons change the visible set', async () => {
    const figures = page.locator('#stories figure');
    const all = await figures.count();
    const tabs = page.locator('#stories [role="group"] button');
    const seen = [];
    for (let t = 1; t < (await tabs.count()); t++) {
      const tab = tabs.nth(t);
      const expected = Number(await tab.locator('span').innerText());
      await tab.click();
      assert((await tab.getAttribute('aria-pressed')) === 'true', `tab ${t} not aria-pressed after click`);
      const n = await figures.count();
      assert(n === expected, `tab "${await tab.innerText()}" shows ${n} figures, its badge says ${expected}`);
      assert(n < all, `tab "${await tab.innerText()}" did not narrow the set (${n} of ${all})`);
      seen.push(n);
    }
    await tabs.first().click();
    assert((await figures.count()) === all, 'All stories did not restore the full set');
    return `all ${all} → ${seen.join(' / ')} → ${all}`;
  });

  await check('lightbox opens, arrow keys step, Escape closes', async () => {
    const dialog = page.getByRole('dialog', { name: 'Photo viewer' });
    const counter = dialog.locator('span.tabular-nums');
    const total = await page.locator('#stories figure').count();
    await page.locator('#stories figure button').first().click();
    await dialog.waitFor({ state: 'visible' });
    assert((await counter.innerText()).trim() === `1 / ${total}`, `opened at ${await counter.innerText()}`);
    assert(await dialog.locator('img').evaluate((i) => i.complete && i.naturalWidth > 0), 'lightbox image did not load');
    assert((await page.evaluate(() => document.body.style.overflow)) === 'hidden', 'page still scrolls behind the lightbox');
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
    assert(focused === 'Close', `focus is on "${focused}", expected the Close button`);
    await page.keyboard.press('ArrowRight');
    assert((await counter.innerText()).trim() === `2 / ${total}`, `ArrowRight → ${await counter.innerText()}`);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    assert((await counter.innerText()).trim() === `${total} / ${total}`, `ArrowLeft wrap → ${await counter.innerText()}`);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert((await page.evaluate(() => document.body.style.overflow)) === '', 'body scroll lock not released');
    return `1 → 2 → 1 → ${total} of ${total}, closed`;
  });

  await check('currency toggle switches € to $', async () => {
    const price = page.locator('#investment article p.font-serif').first();
    const before = await price.innerText();
    assert(before.startsWith('€'), `initial price is "${before}"`);
    await page.locator('#investment').getByRole('button', { name: 'USD $' }).click();
    const after = await price.innerText();
    assert(after.startsWith('$'), `after USD toggle price is "${after}"`);
    await page.locator('#investment').getByRole('button', { name: 'EUR €' }).click();
    assert((await price.innerText()).startsWith('€'), 'EUR toggle did not switch back');
    return `${before.replace(/\s+/g, ' ')} → ${after.replace(/\s+/g, ' ')}`;
  });

  await check('package CTA opens the drawer with that package selected', async () => {
    const article = page.locator('#investment article').nth(1);
    await article.getByRole('button').click();
    const drawer = page.locator('aside[aria-labelledby="inquiry-title"]');
    await page.waitForFunction(() => document.querySelector('aside[aria-labelledby="inquiry-title"]')?.getAttribute('aria-hidden') === 'false');
    const pkg = await drawer.locator('#f-pkg').inputValue();
    assert(pkg && pkg !== 'coastal', `package select is "${pkg}", expected the second package`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('aside[aria-labelledby="inquiry-title"]')?.getAttribute('aria-hidden') === 'true');
    return `#f-pkg = ${pkg}, Escape closed it`;
  });

  await check('no console errors, hydration warnings or failed requests', async () => {
    none(problems, 'problem(s)');
    none(ctx.offOrigin.filter((u) => !isForm(u.split(' ')[1])), 'off-origin request(s)');
    const hyd = problems.filter((p) => /hydrat|#41[89]|#42[35]|did not match/i.test(p));
    none(hyd, 'React hydration complaint(s)');
  });
  await page.close();
}

/** Opens the drawer from the header CTA on a fresh, hydrated page. */
async function openDrawer(mode) {
  const page = await ctx.newPage();
  const problems = watch(page);
  const posts = [];
  const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' };
  await page.route(
    (u) => isForm(u),
    async (route) => {
      const r = route.request();
      if (r.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
      posts.push({ url: r.url(), method: r.method(), headers: await r.allHeaders(), body: r.postData() });
      if (mode === 'error') return route.fulfill({ status: 500, contentType: 'application/json', headers: CORS, body: '{"error":"mocked"}' });
      return route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: '{"ok":true}' });
    },
  );
  await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
  await hydrated(page);
  await page.locator('header').getByRole('button', { name: /Reserve your shoot/ }).click();
  const drawer = page.locator('aside[aria-labelledby="inquiry-title"]');
  await page.waitForFunction(() => document.querySelector('aside[aria-labelledby="inquiry-title"]')?.getAttribute('aria-hidden') === 'false');
  await drawer.locator('#f-name').waitFor({ state: 'visible' });
  return { page, drawer, posts, problems };
}

async function fill(drawer) {
  await drawer.locator('#f-name').fill('Test Visitor');
  await drawer.locator('#f-contact').fill('test@example.com');
  await drawer.locator('#f-country').selectOption({ index: 1 });
  await drawer.locator('#f-from').fill('2027-05-10');
  await drawer.locator('#f-to').fill('2027-05-17');
}

await check('"Reserve your shoot" opens the drawer; empty submit shows the validation message', async () => {
  const { page, drawer, posts, problems } = await openDrawer('ok');
  await drawer.getByRole('button', { name: 'Send inquiry' }).click();
  const alert = drawer.getByRole('alert');
  await alert.waitFor();
  const msg = await alert.innerText();
  assert(/Please add your name/.test(msg), `validation message is "${msg}"`);
  await drawer.locator('#f-from').fill('2027-05-10');
  await drawer.locator('#f-to').fill('2027-05-01');
  await drawer.locator('#f-name').fill('x');
  await drawer.locator('#f-contact').fill('x@y.z');
  await drawer.locator('#f-country').selectOption({ index: 1 });
  await drawer.getByRole('button', { name: 'Send inquiry' }).click();
  assert(/leaving date is before/.test(await alert.innerText()), `reversed dates message is "${await alert.innerText()}"`);
  assert(posts.length === 0, `${posts.length} POST(s) sent by an invalid form`);
  none(problems, 'problem(s)');
  await page.close();
  return `"${msg}"`;
});

await check('filled submit POSTs JSON to FORM_ENDPOINT (mocked) and shows "Inquiry sent"', async () => {
  const { page, drawer, posts, problems } = await openDrawer('ok');
  await fill(drawer);
  await drawer.getByRole('button', { name: 'Send inquiry' }).click();
  await drawer.getByRole('heading', { name: 'Inquiry sent' }).waitFor();
  await page.waitForLoadState('networkidle');
  assert(posts.length === 1, `${posts.length} POSTs, expected 1`);
  const p = posts[0];
  assert(p.method === 'POST', `method ${p.method}`);
  assert(p.url === FORM_ENDPOINT, `posted to ${p.url}, expected ${FORM_ENDPOINT}`);
  assert(/application\/json/.test(p.headers['content-type'] ?? ''), `content-type ${p.headers['content-type']}`);
  const body = JSON.parse(p.body);
  assert(body.formType === FORM_TYPE, `formType ${JSON.stringify(body.formType)}`);
  for (const [k, v] of Object.entries({ name: 'Test Visitor', contact: 'test@example.com', email: 'test@example.com', from: '2027-05-10', to: '2027-05-17' }))
    assert(body[k] === v, `${k} is ${JSON.stringify(body[k])}, expected ${JSON.stringify(v)}`);
  assert(body.country && body.pkg && body.location && body.style, `missing fields: ${p.body}`);
  assert(!('company' in body), 'honeypot field was sent');
  // loading="lazy": give it the moment it needs to be fetched once shown.
  await drawer.locator('img').evaluate(
    (i) => i.complete || new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }),
  );
  assert(await drawer.locator('img').evaluate((i) => i.naturalWidth > 0), 'thank-you image did not load');
  none(problems, 'problem(s)');
  await page.close();
  return `1 POST, formType ${body.formType}, ${Object.keys(body).length} fields`;
});

await check('a mocked HTTP 500 shows the error message and keeps the form', async () => {
  const { page, drawer, posts, problems } = await openDrawer('error');
  await fill(drawer);
  await drawer.getByRole('button', { name: 'Send inquiry' }).click();
  const alert = drawer.getByRole('alert');
  await alert.filter({ hasText: 'could not send' }).waitFor();
  const msg = await alert.innerText();
  assert(posts.length === 1, `${posts.length} POSTs, expected 1`);
  assert((await drawer.getByRole('heading', { name: 'Inquiry sent' }).count()) === 0, 'showed success on a 500');
  assert((await drawer.locator('#f-name').inputValue()) === 'Test Visitor', 'form was cleared after the failure');
  assert(await drawer.getByRole('button', { name: 'Send inquiry' }).isEnabled(), 'submit stays disabled');
  // The browser itself logs the 500 response as a console error; that one is expected.
  none(problems.filter((p) => !/status of 500/.test(p)), 'problem(s)');
  await page.close();
  return `"${msg}"`;
});

for (const width of [390, 320]) {
  await check(`no horizontal overflow at ${width}px (closed, drawer open, lightbox open)`, async () => {
    const c = await context(b, { viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
    const page = await c.newPage();
    const problems = watch(page);
    await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
    await hydrated(page);
    await scrollThrough(page);
    const overflow = () =>
      page.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        if (sw <= w) return null;
        const wide = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.right > w + 0.5 && getComputedStyle(el).position !== 'fixed' && r.width > 0;
          })
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
        return `scrollWidth ${sw} > ${w}: ${wide.join('; ')}`;
      });
    const states = {};
    states.page = await overflow();
    await page.locator('header button').click();
    await page.waitForFunction(() => document.querySelector('aside[aria-labelledby="inquiry-title"]')?.getAttribute('aria-hidden') === 'false');
    states.drawer = await overflow();
    await page.keyboard.press('Escape');
    await page.locator('#stories figure button').first().click();
    await page.getByRole('dialog', { name: 'Photo viewer' }).waitFor();
    states.lightbox = await overflow();
    const bad = Object.entries(states).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    none(bad, 'overflowing state(s)');
    none(problems, 'problem(s)');
    await c.close();
  });
}

console.log('');
console.log(failures === 0 ? '  All checks passed: the prerendered page hydrates cleanly and behaves.' : `  ${failures} check(s) failed.`);

await b.close();
server.close();
process.exit(failures === 0 ? 0 : 1);
