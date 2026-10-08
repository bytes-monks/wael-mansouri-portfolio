# Deployment

| | |
|---|---|
| Host | GitHub Pages, built by GitHub Actions |
| Canonical URL | **https://waelmansouri.com** |
| Also answers | `www.waelmansouri.com` (GitHub redirects it to the apex automatically) |
| Redirects to it | `waelmansouri.bytesmonks.com` (see [`deploy/subdomain-redirect/`](deploy/subdomain-redirect/README.md)) |
| Suggested repo | `bytes-monks/wael-mansouri-portfilio`, next to `bytes-monks/bytes-monks` and `bytes-monks/china-sourcing` |

## 0. Register waelmansouri.com first

As of 2026-10-08 **`waelmansouri.com` is not registered** (the .com registry returns 404 and DNS returns NXDOMAIN).
Register it before the first deploy. Until then the deploy still works, but the custom domain will not resolve, and
anyone could register the name the site's canonical links point to.

If the site has to go live before the domain is bought, temporarily serve it on the subdomain instead: set `SITE_URL`
to `https://waelmansouri.bytesmonks.com` and `public/CNAME` to `waelmansouri.bytesmonks.com`, then add
`waelmansouri  CNAME  bytes-monks.github.io.` (**DNS only**) in Cloudflare. Switch both back once the apex is live and
set up the redirect in step 4.

## 1. Push the code

```bash
git init -b main
git add -A
git commit -m "Wael Mansouri site: static Vite + React build for GitHub Pages"
git remote add origin git@github.com:bytes-monks/wael-mansouri-portfilio.git
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
3. Re-run **Actions → Deploy to GitHub Pages** (or push again).
4. **Settings → Pages → Custom domain: `waelmansouri.com`** → Save. Once the DNS check passes and the certificate is
   issued (minutes to an hour), tick **Enforce HTTPS**.

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

Edit `SITE_URL` in `src/lib/site.ts`, `public/CNAME` (robots.txt and sitemap.xml follow automatically), and the Pages
custom-domain setting. The build fails if `SITE_URL` and `public/CNAME` disagree.
