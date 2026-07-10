import type { AppSupabaseClient } from '@/lib/supabase'
import type { MembershipRole, InviteStatus } from '@/lib/database.types'

export interface InvitePreview {
  circleId: string
  circleName: string
  role: MembershipRole
  status: InviteStatus
}

/** Previews an invite by token (works before the user is a member). */
export async function getInvite(
  supabase: AppSupabaseClient,
  token: string,
): Promise<InvitePreview | null> {
  const { data, error } = await supabase.rpc('get_invite', { invite_token: token })
  if (error) throw error
  const row = (data ?? [])[0]
  return row
    ? { circleId: row.circle_id, circleName: row.circle_name, role: row.role, status: row.status }
    : null
}

/** Accepts an invite, creating the caller's membership. Returns the circle id. */
export async function acceptInvite(
  supabase: AppSupabaseClient,
  token: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('accept_invite', { invite_token: token })
  if (error) throw error
  return data as string
}
