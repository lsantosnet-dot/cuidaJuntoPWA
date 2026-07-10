import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { uuid } from '@/lib/id'
import { fetchShifts, assumeShift, endShift, addShift } from './api'
import type { ShiftRow, NewShift } from './types'

export function useShifts() {
  const { mode, supabase, circleId, user } = useCareData()
  const demo = useDemoState()
  const [shifts, setShifts] = useState<ShiftRow[]>([])
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      setShifts(await fetchShifts(supabase, circleId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar escala')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const list = mode === 'demo' ? demo.shifts : shifts
  const activeShift = useMemo(() => list.find((s) => s.status === 'active') ?? null, [list])

  const assume = useCallback(async () => {
    if (mode === 'demo') {
      const now = new Date().toISOString()
      updateDemo((prev) => ({
        ...prev,
        shifts: [
          {
            id: uuid(),
            circle_id: circleId,
            caregiver_id: user.id,
            caregiver_name: user.name,
            starts_at: now,
            ends_at: null,
            status: 'active',
            notes: null,
            created_at: now,
          },
          ...prev.shifts.map((s) =>
            s.status === 'active' ? { ...s, status: 'ended' as const, ends_at: now } : s,
          ),
        ],
      }))
      return
    }
    if (!supabase) return
    await assumeShift(supabase, { circleId, userId: user.id, userName: user.name })
    await reload()
  }, [mode, supabase, circleId, user, reload])

  const end = useCallback(
    async (shiftId: string) => {
      if (mode === 'demo') {
        const now = new Date().toISOString()
        updateDemo((prev) => ({
          ...prev,
          shifts: prev.shifts.map((s) =>
            s.id === shiftId ? { ...s, status: 'ended' as const, ends_at: now } : s,
          ),
        }))
        return
      }
      if (!supabase) return
      await endShift(supabase, shiftId)
      await reload()
    },
    [mode, supabase, reload],
  )

  const add = useCallback(
    async (input: NewShift) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          shifts: [
            {
              id: uuid(),
              circle_id: circleId,
              caregiver_id: null,
              caregiver_name: input.caregiverName,
              starts_at: input.startsAt,
              ends_at: input.endsAt,
              status: 'scheduled',
              notes: null,
              created_at: new Date().toISOString(),
            },
            ...prev.shifts,
          ],
        }))
        return
      }
      if (!supabase) return
      await addShift(supabase, circleId, input)
      await reload()
    },
    [mode, supabase, circleId, reload],
  )

  return { shifts: list, activeShift, isLoading, error, assume, end, add }
}
