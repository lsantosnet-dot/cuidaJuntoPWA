import { useCallback, useEffect, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState } from '@/features/demo/demoStore'
import { fetchRecipient } from '@/features/profile/api'
import { fetchMedications } from '@/features/medications/api'
import { fetchRecords } from '@/features/history/api'
import { fetchDiary } from '@/features/diary/api'
import { fetchRoutineItems } from '@/features/routine/api'
import type { ReportData } from './types'

const EMPTY: ReportData = {
  recipient: null,
  medications: [],
  records: [],
  diary: [],
  routineItems: [],
}

/** Aggregates every module's data for the care recipient, used to build printable reports. */
export function useReportsData() {
  const { mode, supabase, circleId } = useCareData()
  const demo = useDemoState()
  const [data, setData] = useState<ReportData>(EMPTY)
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      const [recipient, medications, records, diary, routineItems] = await Promise.all([
        fetchRecipient(supabase, circleId),
        fetchMedications(supabase, circleId),
        fetchRecords(supabase, circleId),
        fetchDiary(supabase, circleId),
        fetchRoutineItems(supabase, circleId),
      ])
      setData({
        recipient,
        medications: medications.filter((m) => m.active),
        records,
        diary,
        routineItems: routineItems.filter((i) => i.active),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados do relatório')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const demoData: ReportData = {
    recipient: demo.recipient,
    medications: demo.medications.filter((m) => m.active),
    records: demo.records,
    diary: demo.diary,
    routineItems: demo.routineItems.filter((i) => i.active),
  }

  return { data: mode === 'demo' ? demoData : data, isLoading, error }
}
