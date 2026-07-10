/**
 * Centralized, typed access to build-time environment variables.
 *
 * Every integration degrades gracefully: when a key is missing (e.g. on the
 * public GitHub Pages demo before secrets are configured) the corresponding
 * `is*Configured` flag is false and the app falls back to a safe demo mode
 * instead of crashing.
 */

function read(value: string | undefined): string {
  const trimmed = (value ?? '').trim()
  // Ignore obvious placeholder values from .env.example.
  if (!trimmed || trimmed.startsWith('your_') || trimmed.startsWith('YOUR_')) {
    return ''
  }
  return trimmed
}

export const env = {
  clerkPublishableKey: read(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
  supabaseUrl: read(import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: read(import.meta.env.VITE_SUPABASE_ANON_KEY),
  vapidPublicKey: read(import.meta.env.VITE_VAPID_PUBLIC_KEY),
} as const

export const isClerkConfigured = env.clerkPublishableKey !== ''
export const isSupabaseConfigured =
  env.supabaseUrl !== '' && env.supabaseAnonKey !== ''

/**
 * Auth is "enabled" only when Clerk is configured. Otherwise the app runs in
 * demo mode: browsable shell, no real sign-in, no persistence.
 */
export const isAuthEnabled = isClerkConfigured
