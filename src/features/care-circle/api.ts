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

/**
 * Backfills/refreshes the caller's own display_name, email and avatar_url on
 * every membership row they hold. `create_care_circle` and `accept_invite`
 * never capture these fields, so this keeps them in sync with the signed-in
 * profile (see `sync_member_profile` RPC, SECURITY DEFINER — see supabase/migrations).
 */
export async function syncMemberProfile(
  supabase: AppSupabaseClient,
  profile: { displayName: string | null; email: string | null; avatarUrl: string | null },
): Promise<void> {
  const { error } = await supabase.rpc('sync_member_profile', {
    p_display_name: profile.displayName,
    p_email: profile.email,
    p_avatar_url: profile.avatarUrl,
  })
  if (error) throw error
}
