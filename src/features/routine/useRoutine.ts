import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { uuid } from '@/lib/id'
import { todayISODate } from '@/lib/datetime'
import { buildProgress } from './progress'
import {
  fetchRoutineItems,
  fetchTodayRoutineLogs,
  logCompletion,
  undoLastCompletion,
  addRoutineItem as addRoutineItemApi,
  removeRoutineItem,
} from './api'
import type { RoutineProgress, RoutineItemRow, RoutineLogRow, NewRoutineItem } from './types'

export function useRoutine() {
  const { mode, supabase, circleId, user } = useCareData()
  const demo = useDemoState()
  const [items, setItems] = useState<RoutineItemRow[]>([])
  const [logs, setLogs] = useState<RoutineLogRow[]>([])
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      const [i, l] = await Promise.all([
        fetchRoutineItems(supabase, circleId),
        fetchTodayRoutineLogs(supabase, circleId),
      ])
      setItems(i)
      setLogs(l)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar a rotina')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const progress = useMemo<RoutineProgress[]>(
    () =>
      mode === 'demo'
        ? buildProgress(demo.routineItems, demo.routineLogs)
        : buildProgress(items, logs),
    [mode, demo.routineItems, demo.routineLogs, items, logs],
  )

  const markDone = useCallback(
    async (progressItem: RoutineProgress) => {
      const item = progressItem.item
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          routineLogs: [
            ...prev.routineLogs,
            {
              id: uuid(),
              circle_id: circleId,
              routine_item_id: item.id,
              log_date: todayISODate(),
              completed_at: new Date().toISOString(),
              completed_by: user.id,
              completed_by_name: user.name,
              created_at: new Date().toISOString(),
            },
          ],
        }))
        return
      }
      if (!supabase) return
      await logCompletion(supabase, {
        circleId,
        routineItemId: item.id,
        userId: user.id,
        userName: user.name,
      })
      await reload()
    },
    [mode, supabase, circleId, user, reload],
  )

  const undoLast = useCallback(
    async (progressItem: RoutineProgress) => {
      const lastLogId = progressItem.logIds[progressItem.logIds.length - 1]
      if (!lastLogId) return
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          routineLogs: prev.routineLogs.filter((l) => l.id !== lastLogId),
        }))
        return
      }
      if (!supabase) return
      await undoLastCompletion(supabase, lastLogId)
      await reload()
    },
    [mode, supabase, reload],
  )

  const addItem = useCallback(
    async (input: NewRoutineItem) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          routineItems: [
            ...prev.routineItems,
            {
              id: uuid(),
              circle_id: circleId,
              type: input.type,
              name: input.name,
              target_count_per_day: input.targetCountPerDay,
              notes: null,
              active: true,
              created_at: new Date().toISOString(),
            },
          ],
        }))
        return
      }
      if (!supabase) return
      await addRoutineItemApi(supabase, circleId, input)
      await reload()
    },
    [mode, supabase, circleId, reload],
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          routineItems: prev.routineItems.filter((i) => i.id !== itemId),
          routineLogs: prev.routineLogs.filter((l) => l.routine_item_id !== itemId),
        }))
        return
      }
      if (!supabase) return
      await removeRoutineItem(supabase, itemId)
      await reload()
    },
    [mode, supabase, reload],
  )

  return { progress, isLoading, error, markDone, undoLast, addItem, removeItem }
}
