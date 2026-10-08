# Wael Mansouri — Photography Website

Editorial one-page site for vacation, honeymoon, maternity and couple photography across Tunisia.
Built with **React 19**, **Vite 5**, **Tailwind CSS 3** and TypeScript, prerendered to static HTML and
hosted on **GitHub Pages** at **https://waelmansouri.com** (with `waelmansouri.bytesmonks.com` redirecting there).

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional: WhatsApp number / form endpoint
npm run dev                  # http://localhost:5173
npm run build && npm run preview   # the exact production output
```

## How the build works

`npm run build` runs, in order:

1. `scripts/images.mjs` — makes 480/828/1200/1600px copies of every `public/images/*.webp`
   (into the gitignored `public/images/w/`) plus `src/generated/images.json`, which `<Img>` turns into `srcset`.
   This replaces `next/image`'s on-demand resizing, which needs a server.
2. `tsc` — typecheck.
3. `vite build` — client bundle into `dist/`.
4. `vite build --ssr` — server render bundle into `.ssr/`.
5. `scripts/prerender.mjs` — renders the page into `dist/index.html` (so it works without JavaScript and is
   fully crawlable), injects the title/description/Open Graph tags, writes `sitemap.xml`, and fails if
   `public/CNAME` does not match `SITE_URL`.

The result in `dist/` is plain static files: no server, no API routes.

`npm run check:hydration` (after `npm run build`; first run `npx playwright install chromium`) loads the built
page in Chromium with and without JavaScript and fails on incomplete prerendered markup, a hydration mismatch,
any console error or failed request, broken gallery/lightbox/currency/inquiry-form behaviour, or sideways scroll
at 390px/320px. The form's endpoint is mocked; it never sends a real inquiry.

## Deploying

Pushing to `main` deploys automatically (`.github/workflows/deploy.yml`). Pull requests and other branches run
typecheck + build, and the browser hydration check (`.github/workflows/ci.yml`). See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the one-time GitHub
and DNS setup for both domains.

## Settings

| Setting | Where |
|---|---|
| Canonical domain | `SITE_URL` in `src/lib/site.ts` **and** `public/CNAME` (the build checks they agree) |
| WhatsApp number | GitHub repository variable `VITE_WHATSAPP` (digits only, e.g. `21612345678`) |
| Inquiry form destination | GitHub repository variable `VITE_FORM_ENDPOINT`; default in `src/lib/site.ts` |

The inquiry form posts JSON (name, contact, country, dates, location, style, package, `formType:
"wael-mansouri-inquiry"`) to a hosted form collector, since a static site has no server to send email from.

## Where to edit things

| You want to change… | Edit |
|---|---|
| Prices, package inclusions, testimonial, process steps, destinations, form options | `src/data/content.ts` |
| Portfolio photos, captions, categories and alt text | `src/data/shots.ts` and `public/images/` |
| SEO title, description, keywords, structured data | `src/data/content.ts` (`site`) and `src/lib/seo.ts` |
| Colours and fonts | `tailwind.config.ts` |
| Section layout | `src/components/` (one file per section) |

### Adding a portfolio photo
1. Export it as WebP, 2400px on the long edge, and put it in `public/images/`.
2. Add a line to `shots` in `src/data/shots.ts` with its width, height, category (`couples`, `solo` or `travel`), title, place and alt text.

## Sections

Header · Hero (El Jem + Sousse) · Intro · Stories (filterable gallery with lightbox) · "Light first" banner · Destinations (Sidi Bou Said, El Jem, Djerba, Sahara + Zriba el Olia, olive country, Djerba galleries) · The Experience (3 steps) · Testimonial · Investment (EUR/USD toggle) · Closing call to action · Footer · Inquiry drawer (posts to the form collector in `src/lib/site.ts`).

## SEO included

- Title, description, keywords, canonical URL, Open Graph and Twitter cards (`public/og.jpg`).
- `ProfessionalService` structured data (JSON-LD) with service areas, languages and offers.
- Fully prerendered HTML; `sitemap.xml` and `robots.txt` generated at build.
- Descriptive alt text on every photo; images served as WebP at responsive sizes (`srcset`) and lazy-loaded below the fold.

## Notes

- Package prices: €300 is the set price for The Coastal Session and $1,500 for the Full-Day Destination Story. The other currency is an approximate conversion; it is labelled "approx." on the page. Update both in `src/data/content.ts` when exchange rates move.
- The testimonial is published as written by the client. Confirm you have their permission, and add their first name and country to `testimonial.cite` if they agree.
- Photos include your signature watermark. If you want clean versions on the site, replace the files in `public/images/` keeping the same names.
