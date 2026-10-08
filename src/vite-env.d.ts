/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_WHATSAPP?: string;
  readonly VITE_FORM_ENDPOINT?: string;
}

declare const __BUILD_YEAR__: string;
