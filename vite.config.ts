import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    {
      // The real head tags are injected by scripts/prerender.mjs at build
      // time; give `npm run dev` a title so the tab is not blank.
      name: 'dev-head',
      apply: 'serve',
      transformIndexHtml: (html) => html.replace('<!--head-->', '<title>Wael Mansouri (dev)</title>'),
    },
  ],
  define: {
    // Shared by the client and SSR builds so the prerendered copyright year
    // can never disagree with the hydrated one.
    __BUILD_YEAR__: JSON.stringify(String(new Date().getFullYear())),
  },
  build: {
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            // Framework code changes far less often than copy; its own hash
            // keeps it cached across ordinary content deploys.
            manualChunks: { vendor: ['react', 'react-dom', 'react-dom/client', 'scheduler'] },
          },
        },
  },
  // '/' for the custom domain, '/wael-mansouri-portfolio/' for the github.io
  // project URL. Must be the path part of VITE_SITE_URL (prerender checks).
  base: (process.env.BASE_URL || '/').replace(/\/{2,}/g, '/'),
}));
