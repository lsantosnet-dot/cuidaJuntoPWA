import { useMemo, useRef } from 'react'
import { useAuth } from '@/features/auth'
import { createBoundSupabaseClient, type AppSupabaseClient } from '@/lib/supabase'

/**
 * Returns a stable Supabase client bound to the current user's Clerk token,
 * or `null` when Supabase is not configured (demo build).
 *
 * The client is created once; a ref keeps the token getter fresh across
 * re-renders without recreating the client on every render.
 */
export function useSupabaseClient(): AppSupabaseClient | null {
  const { getToken } = useAuth()
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  return useMemo(
    () => createBoundSupabaseClient(() => getTokenRef.current()),
    [],
  )
}
