/**
 * Deployment-level settings. Everything that differs between "the code" and
 * "where it runs" lives here, so a domain or inbox change is a one-file edit.
 */

/** Canonical origin, no trailing slash. Must match public/CNAME. */
export const SITE_URL = 'https://waelmansouri.com';

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
