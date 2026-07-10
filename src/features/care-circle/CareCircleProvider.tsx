import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { CareCircleContext } from './CareCircleContext'
import { fetchMemberships, createCareCircle } from './api'
import type { MembershipWithCircle, CareCircleState } from './types'

const ACTIVE_CIRCLE_KEY = 'cuidajunto.activeCircle'

export function CareCircleProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabaseClient()
  const { isSignedIn, isDemo } = useAuth()
  const isEnabled = supabase !== null && isSignedIn && !isDemo

  const [memberships, setMemberships] = useState<MembershipWithCircle[]>([])
  const [activeCircleId, setActiveId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_CIRCLE_KEY),
  )
  const [isLoading, setIsLoading] = useState(isEnabled)
  const [error, setError] = useState<string | null>(null)

  const setActiveCircleId = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_CIRCLE_KEY, id)
    setActiveId(id)
  }, [])

  const refresh = useCallback(async () => {
    if (!supabase || !isEnabled) {
      setMemberships([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const rows = await fetchMemberships(supabase)
      setMemberships(rows)
      // Keep a valid active circle: honor stored choice, else pick the first.
      setActiveId((prev) => {
        const stored = prev ?? localStorage.getItem(ACTIVE_CIRCLE_KEY)
        const valid = rows.find((m) => m.circle_id === stored)
        const next = valid?.circle_id ?? rows[0]?.circle_id ?? null
        if (next) localStorage.setItem(ACTIVE_CIRCLE_KEY, next)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load care circles')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, isEnabled])

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
    const active = memberships.find((m) => m.circle_id === activeCircleId) ?? null
    return {
      isEnabled,
      isLoading,
      error,
      memberships,
      activeCircleId,
      activeCircle: active?.care_circles ?? null,
      activeRole: active?.role ?? null,
      needsOnboarding: isEnabled && !isLoading && !error && memberships.length === 0,
      setActiveCircleId,
      refresh,
      createCircle,
    }
  }, [
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
