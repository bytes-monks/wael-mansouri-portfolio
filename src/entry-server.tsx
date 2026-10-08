import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { site } from './data/content';
import { keywords, ogImage } from './lib/seo';

/** The page body, rendered once at build time by scripts/prerender.mjs. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Head tags injected at <!--head--> in index.html. */
export function head(): string {
  const url = `${site.url}/`;
  const img = `${site.url}${ogImage.path}`;
  return [
    `<title>${esc(site.title)}</title>`,
    `<meta name="description" content="${esc(site.description)}" />`,
    `<meta name="keywords" content="${esc(keywords.join(', '))}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(site.title)}" />`,
    `<meta property="og:description" content="${esc(site.description)}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="${ogImage.width}" />`,
    `<meta property="og:image:height" content="${ogImage.height}" />`,
    `<meta property="og:image:alt" content="${esc(ogImage.alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(site.title)}" />`,
    `<meta name="twitter:description" content="${esc(site.description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
  ].join('\n    ');
}

export const origin = site.url;
