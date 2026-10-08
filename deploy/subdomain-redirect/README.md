# waelmansouri.bytesmonks.com → waelmansouri.com

A GitHub Pages site can serve exactly one custom domain, and the main site
already uses `waelmansouri.com`. This folder is a second, tiny Pages site whose
only job is to send `waelmansouri.bytesmonks.com` visitors to the main domain,
keeping the path and `#anchor`.

It is **not** built or deployed by this repository's workflows. Use it one of
two ways (pick one). `bytesmonks.com` is on Cloudflare, so **Option B is recommended**: a real
301, no extra repository.

## Option A — a second GitHub repository (works with any DNS provider)

1. Create an empty repository, e.g. `waelmansouri-redirect`, in the same
   GitHub account or organisation.
2. Copy `CNAME`, `index.html` and `404.html` from this folder to its root and
   push to `main`.
3. In that repository: **Settings → Pages → Source: Deploy from a branch →
   `main` / `(root)`**, then **Custom domain: `waelmansouri.bytesmonks.com`**
   and tick **Enforce HTTPS** once the certificate is issued.
4. DNS for `bytesmonks.com` (Cloudflare): add
   `waelmansouri  CNAME  bytes-monks.github.io.` set to **DNS only (grey cloud)**. A proxied (orange) record stops
   GitHub issuing the certificate, so Enforce HTTPS would stay unavailable.

`404.html` is a copy of `index.html` so any deep link
(`waelmansouri.bytesmonks.com/anything`) also redirects.

## Option B — a DNS-level redirect (if bytesmonks.com is on Cloudflare)

Skip the repository. Add a proxied DNS record
`waelmansouri  A  192.0.2.1` (orange cloud; the IP is a placeholder that is
never reached) and a **Rules → Redirect Rules** entry:

- When: Hostname equals `waelmansouri.bytesmonks.com`
- Then: Dynamic redirect, expression
  `concat("https://waelmansouri.com", http.request.uri.path)`,
  status **301**, preserve query string.

This is a true 301, which search engines prefer over the meta-refresh above.
