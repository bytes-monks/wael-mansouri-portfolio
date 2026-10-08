# Deployment

| | |
|---|---|
| Host | GitHub Pages, built by GitHub Actions |
| Canonical URL | **https://waelmansouri.com** once the custom domain is set |
| Live now | **https://bytes-monks.github.io/wael-mansouri-portfolio/**, the default Pages address. Once the custom domain is set, GitHub redirects it to `waelmansouri.com`, keeping the path |
| Also answers | `www.waelmansouri.com` (GitHub redirects it to the apex automatically) |
| Redirects to it | `waelmansouri.bytesmonks.com` (see [`deploy/subdomain-redirect/`](deploy/subdomain-redirect/README.md)) |
| Repository | `bytes-monks/wael-mansouri-portfolio`, next to `bytes-monks/bytes-monks` and `bytes-monks/china-sourcing` |

## 0. Register waelmansouri.com first

As of 2026-10-08 **`waelmansouri.com` is not registered** (the .com registry returns 404 and DNS returns NXDOMAIN).
Nothing is blocked meanwhile: until a custom domain is set in **Settings → Pages**, every deploy builds for, and is
served at, **https://bytes-monks.github.io/wael-mansouri-portfolio/**. Do not set the custom domain in step 2.4 until
the domain is registered and its DNS (step 3) is in place, or the site will redirect to an address that does not
resolve.

## 1. Push the code

```bash
git init -b main
git add -A
git commit -m "Wael Mansouri site: static Vite + React build for GitHub Pages"
git remote add origin git@github.com:bytes-monks/wael-mansouri-portfolio.git
git push -u origin main
```

## 2. One-time GitHub settings

In the repository:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → Variables → New repository variable:**
   - `VITE_WHATSAPP` = Wael's WhatsApp number, digits only (e.g. `21612345678`).
   - `VITE_FORM_ENDPOINT` (optional) = a form collector URL that delivers to Wael's inbox. If unset, the form uses
     the shared formgrid.dev collector in `src/lib/site.ts` (the Bytes Monks one), tagged
     `formType: "wael-mansouri-inquiry"`.
3. Re-run **Actions → Deploy to GitHub Pages** (or push again). The site is now live at
   https://bytes-monks.github.io/wael-mansouri-portfolio/.
4. Once waelmansouri.com is registered and has the DNS from step 3: **Settings → Pages → Custom domain:
   `waelmansouri.com`** → Save. When the DNS check passes and the certificate is issued (minutes to an hour), tick
   **Enforce HTTPS**.
5. **Re-run Actions → Deploy to GitHub Pages.** Saving a domain does not trigger a build, and the build is what
   writes the canonical links, sitemap and asset paths for the new address (see below).

Recommended: verify the domain for the organisation (**Org settings → Pages → Add a domain**) so no other GitHub
account can claim it. GitHub gives a `TXT _github-pages-challenge-bytes-monks.waelmansouri.com` record to add.

## 3. DNS for waelmansouri.com (at the domain registrar)

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `bytes-monks.github.io.` |

Remove any other A/AAAA/ALIAS records on `@` (registrar parking pages). If the DNS is on Cloudflare, set these
records to **DNS only** (grey cloud) so GitHub can issue the certificate.

Check: `dig +short waelmansouri.com` should print the four `185.199.x.153` addresses.

## 4. waelmansouri.bytesmonks.com

GitHub Pages serves one custom domain per site, so the subdomain is a redirect, not a second copy (a second
copy would also split search ranking between two URLs). Follow
[`deploy/subdomain-redirect/README.md`](deploy/subdomain-redirect/README.md): either a tiny second Pages repository
(`waelmansouri  CNAME  bytes-monks.github.io.` in the `bytesmonks.com` zone) or a Cloudflare redirect rule.

## What runs when

| Event | Workflow | Does |
|---|---|---|
| Push to `main`, or manual run | `deploy.yml` | install → full build + prerender → upload → deploy to Pages |
| Pull request / push to another branch | `ci.yml` | install → typecheck → full build; in parallel, build + `check:hydration` in Chromium (no deploy) |

Deploys queue rather than cancel each other, so a half-finished deploy never leaves the site broken.

## Changing the domain later

Nothing in the code names the live address. The deploy workflow asks GitHub Pages where the site is served
(`actions/configure-pages` outputs `base_url` and `base_path`) and builds for exactly that:

| Pages custom domain | `VITE_SITE_URL` | `BASE_URL` |
|---|---|---|
| none | `https://bytes-monks.github.io/wael-mansouri-portfolio` | `/wael-mansouri-portfolio/` |
| `waelmansouri.com` | `https://waelmansouri.com` | `/` |

So changing the domain is: change it in **Settings → Pages**, then re-run the deploy. Canonical links, Open Graph
URLs, JSON-LD, `sitemap.xml`, `robots.txt`, `404.html` and every asset path follow. `DEFAULT_SITE_URL` in
`src/lib/site.ts` is only the fallback for local builds. CI also builds the github.io variant on every pull request,
and the build fails if any URL would escape the subpath.
