import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { DEMO_CIRCLE_ID, DEMO_USER_ID } from '@/features/demo/demoStore'
import { CareCircleContext } from './CareCircleContext'
import { fetchMemberships, createCareCircle, syncMemberProfile } from './api'
import type { MembershipWithCircle, CareCircleState } from './types'

// Active-circle choice is per user (not per browser), so switching Clerk
// accounts never inherits a stale circle.
const storageKey = (userId: string | undefined) =>
  `cuidajunto.activeCircle.${userId ?? 'anon'}`

// A single synthetic circle so the switcher and settings are populated in demo.
const DEMO_MEMBERSHIP: MembershipWithCircle = {
  id: 'demo-membership',
  circle_id: DEMO_CIRCLE_ID,
  user_id: DEMO_USER_ID,
  role: 'admin',
  display_name: 'Você',
  email: null,
  avatar_url: null,
  created_at: new Date().toISOString(),
  care_circles: {
    id: DEMO_CIRCLE_ID,
    name: 'Cuidado de Sr. Antenor',
    created_by: DEMO_USER_ID,
    created_at: new Date().toISOString(),
  },
}

export function CareCircleProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabaseClient()
  const { user, isSignedIn, isDemo } = useAuth()
  const isEnabled = supabase !== null && isSignedIn && !isDemo
  const key = storageKey(user?.id)

  const [memberships, setMemberships] = useState<MembershipWithCircle[]>([])
  const [activeCircleId, setActiveId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(isEnabled)
  const [error, setError] = useState<string | null>(null)

  const setActiveCircleId = useCallback(
    (id: string) => {
      localStorage.setItem(key, id)
      setActiveId(id)
    },
    [key],
  )

  const refresh = useCallback(async () => {
    if (!supabase || !isEnabled) {
      setMemberships([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    if (user) {
      // Best-effort: never let a profile-sync hiccup (e.g. a pending
      // migration) block loading the user's real circles below.
      try {
        await syncMemberProfile(supabase, {
          displayName: user.name,
          email: user.email,
          avatarUrl: user.imageUrl,
        })
      } catch (err) {
        console.error('syncMemberProfile failed', err)
      }
    }
    try {
      const rows = await fetchMemberships(supabase)
      setMemberships(rows)
      // Keep a valid active circle: honor stored choice, else pick the first.
      setActiveId((prev) => {
        const stored = prev ?? localStorage.getItem(key)
        const valid = rows.find((m) => m.circle_id === stored)
        const next = valid?.circle_id ?? rows[0]?.circle_id ?? null
        if (next) localStorage.setItem(key, next)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load care circles')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, isEnabled, key, user])

  const createCircle = useCallback(
    async (input: { name: string; recipientName?: string }) => {
      if (!supabase) return null
      const id = await createCareCircle(supabase, input)
      await refresh()
      setActiveCircleId(id)
      return id
    },
    [supabase, refresh, setActiveCircleId],
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<CareCircleState>(() => {
    const list = isDemo ? [DEMO_MEMBERSHIP] : memberships
    const currentId = isDemo ? DEMO_CIRCLE_ID : activeCircleId
    const active = list.find((m) => m.circle_id === currentId) ?? null
    return {
      isEnabled,
      isLoading,
      error,
      memberships: list,
      activeCircleId: currentId,
      activeCircle: active?.care_circles ?? null,
      activeRole: active?.role ?? null,
      needsOnboarding: isEnabled && !isLoading && !error && memberships.length === 0,
      setActiveCircleId,
      refresh,
      createCircle,
    }
  }, [
    isDemo,
    isEnabled,
    isLoading,
    error,
    memberships,
    activeCircleId,
    setActiveCircleId,
    refresh,
    createCircle,
  ])

  return (
    <CareCircleContext.Provider value={value}>{children}</CareCircleContext.Provider>
  )
}
