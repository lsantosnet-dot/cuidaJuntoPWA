import type { AppSupabaseClient } from '@/lib/supabase'
import type { MembershipRow, InviteRow, NewInvite } from './types'

export async function fetchMembers(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<MembershipRow[]> {
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('circle_id', circleId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function fetchInvites(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<InviteRow[]> {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('circle_id', circleId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createInvite(
  supabase: AppSupabaseClient,
  input: { circleId: string; invitedBy: string; invite: NewInvite },
): Promise<InviteRow> {
  const { data, error } = await supabase
    .from('invites')
    .insert({
      circle_id: input.circleId,
      email: input.invite.email,
      role: input.invite.role,
      invited_by: input.invitedBy,
      status: 'pending',
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function revokeInvite(supabase: AppSupabaseClient, inviteId: string): Promise<void> {
  const { error } = await supabase
    .from('invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
  if (error) throw error
}

export async function removeMember(
  supabase: AppSupabaseClient,
  membershipId: string,
): Promise<void> {
  const { error } = await supabase.from('memberships').delete().eq('id', membershipId)
  if (error) throw error
}
