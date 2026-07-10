import { useCallback, useEffect, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { uuid } from '@/lib/id'
import { fetchMembers, fetchInvites, createInvite, revokeInvite } from './api'
import type { MembershipRow, InviteRow, NewInvite } from './types'

export function useTeam() {
  const { mode, supabase, circleId, user } = useCareData()
  const demo = useDemoState()
  const [members, setMembers] = useState<MembershipRow[]>([])
  const [invites, setInvites] = useState<InviteRow[]>([])
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      const [m, i] = await Promise.all([
        fetchMembers(supabase, circleId),
        fetchInvites(supabase, circleId),
      ])
      setMembers(m)
      setInvites(i)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar equipe')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const invite = useCallback(
    async (input: NewInvite): Promise<InviteRow> => {
      if (mode === 'demo') {
        const created: InviteRow = {
          id: uuid(),
          circle_id: circleId,
          email: input.email,
          role: input.role,
          status: 'pending',
          invited_by: user.id,
          token: uuid(),
          created_at: new Date().toISOString(),
        }
        updateDemo((prev) => ({ ...prev, invites: [created, ...prev.invites] }))
        return created
      }
      if (!supabase) throw new Error('Supabase not configured')
      const created = await createInvite(supabase, { circleId, invitedBy: user.id, invite: input })
      await reload()
      return created
    },
    [mode, supabase, circleId, user, reload],
  )

  const revoke = useCallback(
    async (inviteId: string) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          invites: prev.invites.filter((i) => i.id !== inviteId),
        }))
        return
      }
      if (!supabase) return
      await revokeInvite(supabase, inviteId)
      await reload()
    },
    [mode, supabase, reload],
  )

  return {
    members: mode === 'demo' ? demo.members : members,
    invites: mode === 'demo' ? demo.invites : invites,
    isLoading,
    error,
    invite,
    revoke,
  }
}
