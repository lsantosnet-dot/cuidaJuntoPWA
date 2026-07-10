/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Injected at build time from package.json (see vite.config.ts → define).
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_VAPID_PUBLIC_KEY: string
  readonly VITE_BASE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
