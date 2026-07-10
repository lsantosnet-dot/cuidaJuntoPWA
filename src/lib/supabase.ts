import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '@/config/env'
import type { Database } from '@/lib/database.types'

export { isSupabaseConfigured }

export type AppSupabaseClient = SupabaseClient<Database>

type GetToken = () => Promise<string | null>

/**
 * Creates a Supabase client whose requests carry the caller's Clerk session
 * token. Supabase verifies that token via the Clerk third-party auth
 * integration, so Row Level Security can key off `auth.jwt() ->> 'sub'`
 * (the Clerk user id). See supabase/README.md for the one-time setup.
 *
 * Returns `null` when Supabase is not configured (demo build).
 */
export function createBoundSupabaseClient(getToken: GetToken): AppSupabaseClient | null {
  if (!isSupabaseConfigured) return null

  // With `accessToken` set, Supabase delegates auth to Clerk and its own auth
  // client stays dormant — so we don't pass `auth` options here.
  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    accessToken: async () => (await getToken()) ?? null,
  })
}
