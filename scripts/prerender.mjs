// Turns the client build into finished static HTML for GitHub Pages.
//
//   1. Renders <App/> with the SSR bundle (.ssr/entry-server.js) into
//      dist/index.html at <!--app-->, so crawlers and no-JS visitors get the
//      whole page and the client hydrates instead of rendering from scratch.
//   2. Injects the SEO head (title, description, canonical, Open Graph) at
//      <!--head-->, from the same data the page renders.
//   3. Writes dist/sitemap.xml and dist/robots.txt from the same origin. <lastmod> is the date of the last commit, so
//      the deploy workflow checks out with fetch-depth: 0.
//   4. Fills the deploy base into dist/404.html, and writes dist/CNAME when
//      the site is on a custom domain (informational: Actions-based Pages
//      deploys take the domain from Settings -> Pages, not from this file).
//   5. Fails the build if BASE_URL is not the path of SITE_URL, or if any
//      root-absolute URL in the output escapes the base — the bug that breaks
//      every asset on a github.io project URL.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const fail = (msg) => {
  console.error(`prerender: ${msg}`);
  process.exit(1);
};

const { render, head, origin } = await import(pathToFileURL(path.join(ROOT, '.ssr/entry-server.js')).href);

const indexPath = path.join(DIST, 'index.html');
let html = await readFile(indexPath, 'utf8');
for (const marker of ['<!--head-->', '<!--app-->']) {
  if (!html.includes(marker)) fail(`${marker} missing from dist/index.html`);
}
let body = render();
if (body.length < 1000) fail(`rendered body is suspiciously small (${body.length} bytes)`);
// React emits <link rel="preload"> for priority images at the start of its
// output. Inside #root they work but are found later than in <head>, so hoist
// them. Hydration does not need them in the tree (check:hydration verifies).
const preloads = [];
body = body.replace(/^(?:<link rel="preload"[^>]*\/>)+/, (m) => (preloads.push(m), ''));
html = html
  .replace('<!--head-->', () => [head(), ...preloads].join('\n    '))
  .replace('<!--app-->', () => body);
await writeFile(indexPath, html);

let lastmod;
try {
  lastmod = execFileSync('git', ['log', '-1', '--format=%cs'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch {}
if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod ?? '')) lastmod = new Date().toISOString().slice(0, 10);

await writeFile(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
);

await writeFile(
  path.join(DIST, 'robots.txt'),
  `# ${origin}/robots.txt
# The page is prerendered to static HTML — nothing here needs JavaScript to be crawled.

User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`,
);

const BASE = (process.env.BASE_URL || '/').replace(/\/{2,}/g, '/');
const site = new URL(`${origin}/`);
if (site.pathname !== BASE) fail(`BASE_URL is "${BASE}" but SITE_URL ${origin} has path "${site.pathname}" — they must match`);

const notFoundPath = path.join(DIST, '404.html');
await writeFile(notFoundPath, (await readFile(notFoundPath, 'utf8')).replaceAll('%BASE%', BASE));

const customDomain = !site.host.endsWith('.github.io');
if (customDomain) await writeFile(path.join(DIST, 'CNAME'), `${site.host}\n`);

if (BASE !== '/') {
  for (const file of ['index.html', '404.html']) {
    const text = await readFile(path.join(DIST, file), 'utf8');
    const urls = [...text.matchAll(/(?:href|src|content)="(\/[^"]*)"|(?:srcset|imagesrcset)="([^"]*)"/gi)]
      .flatMap((m) => (m[1] ? [m[1]] : m[2].split(',').map((c) => c.trim().split(/\s+/)[0])))
      .filter((u) => u.startsWith('/') && !u.startsWith('//') && !u.startsWith(BASE));
    if (urls.length) fail(`${file} has ${urls.length} URL(s) outside base ${BASE}, e.g. ${urls.slice(0, 3).join(', ')}`);
  }
}

console.log(
  `prerender: ${origin}/ (base ${BASE}) — index.html (${(body.length / 1024).toFixed(1)} KB body), sitemap.xml (lastmod ${lastmod}), robots.txt, 404.html, ` +
    `${customDomain ? `CNAME ${site.host}` : 'no CNAME (github.io)'}, ${preloads.length ? 'hoisted image preload' : 'no preload'}`,
);
