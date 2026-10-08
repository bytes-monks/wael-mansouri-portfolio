// Turns the client build into finished static HTML for GitHub Pages.
//
//   1. Renders <App/> with the SSR bundle (.ssr/entry-server.js) into
//      dist/index.html at <!--app-->, so crawlers and no-JS visitors get the
//      whole page and the client hydrates instead of rendering from scratch.
//   2. Injects the SEO head (title, description, canonical, Open Graph) at
//      <!--head-->, from the same data the page renders.
//   3. Writes dist/sitemap.xml and dist/robots.txt from the same origin. <lastmod> is the date of the last commit, so
//      the deploy workflow checks out with fetch-depth: 0.
//   4. Fails the build if dist/CNAME disagrees with the canonical origin.
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

const cname = (await readFile(path.join(DIST, 'CNAME'), 'utf8').catch(() => '')).trim();
const host = new URL(origin).host;
if (cname !== host) fail(`dist/CNAME is "${cname}" but SITE_URL host is "${host}" — they must match`);

console.log(`prerender: index.html (${(body.length / 1024).toFixed(1)} KB body), sitemap.xml (lastmod ${lastmod}), robots.txt, ${preloads.length ? 'hoisted image preload' : 'no preload'}, CNAME ${cname}`);
