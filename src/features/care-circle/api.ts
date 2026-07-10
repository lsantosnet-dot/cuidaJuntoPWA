import type { AppSupabaseClient } from '@/lib/supabase'
import type { MembershipWithCircle } from './types'

/** Loads the current user's memberships, each joined with its care circle. */
export async function fetchMemberships(
  supabase: AppSupabaseClient,
): Promise<MembershipWithCircle[]> {
  const { data, error } = await supabase
    .from('memberships')
    .select('*, care_circles(*)')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as MembershipWithCircle[]
}

/**
 * Creates a care circle and the creator's admin membership atomically via the
 * `create_care_circle` RPC (SECURITY DEFINER — see supabase/migrations).
 * Returns the new circle id.
 */
export async function createCareCircle(
  supabase: AppSupabaseClient,
  input: { name: string; recipientName?: string },
): Promise<string> {
  const { data, error } = await supabase.rpc('create_care_circle', {
    circle_name: input.name,
    recipient_name: input.recipientName ?? null,
  })

  if (error) throw error
  return data as string
}
