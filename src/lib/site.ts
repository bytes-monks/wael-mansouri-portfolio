/**
 * Deployment-level settings. Everything that differs between "the code" and
 * "where it runs" lives here, so a domain or inbox change is a one-file edit.
 */

/** Where the site lives once the custom domain is live. */
export const DEFAULT_SITE_URL = 'https://waelmansouri.com';

/**
 * Canonical URL of the site root, no trailing slash. The deploy workflow sets
 * VITE_SITE_URL to the address GitHub Pages actually serves — today
 * https://bytes-monks.github.io/wael-mansouri-portfolio, and
 * https://waelmansouri.com once that custom domain is configured — together
 * with BASE_URL (the path part). Local builds fall back to the custom domain.
 */
// Always https: the Pages API reports http:// until "Enforce HTTPS" is ticked.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL)
  .replace(/^http:\/\//, 'https://')
  .replace(/\/+$/, '');

/**
 * WhatsApp number, digits only with country code (e.g. 21612345678).
 * Set as the VITE_WHATSAPP repository variable in GitHub (Settings → Secrets
 * and variables → Actions → Variables); it is baked into the static build.
 * Empty hides the "Continue on WhatsApp" button.
 */
export const WHATSAPP = (import.meta.env.VITE_WHATSAPP ?? '').replace(/\D/g, '');

/**
 * Where the inquiry form POSTs (JSON). A static host has no server of its own,
 * so this is a hosted form collector — the same formgrid.dev collector the
 * Bytes Monks sites use. Override with the VITE_FORM_ENDPOINT repository
 * variable to send inquiries to Wael's own inbox.
 */
export const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || 'https://formgrid.dev/api/f/jjl2cap8';

/** Tags submissions so they can be told apart in a shared collector inbox. */
export const FORM_TYPE = 'wael-mansouri-inquiry';

/** Resolve a public/ path against the deploy base. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
