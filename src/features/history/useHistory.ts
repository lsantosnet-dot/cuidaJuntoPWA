import { useCallback, useEffect, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { uuid } from '@/lib/id'
import { fetchRecords, addRecord, deleteRecord } from './api'
import type { MedicalRecordRow, NewRecord } from './types'

export function useHistory() {
  const { mode, supabase, circleId } = useCareData()
  const demo = useDemoState()
  const [records, setRecords] = useState<MedicalRecordRow[]>([])
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      setRecords(await fetchRecords(supabase, circleId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar histórico')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const add = useCallback(
    async (input: NewRecord) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          records: [
            {
              id: uuid(),
              circle_id: circleId,
              title: input.title,
              category: input.category,
              record_date: input.recordDate,
              details: input.details || null,
              attachment_url: null,
              created_at: new Date().toISOString(),
            },
            ...prev.records,
          ].sort((a, b) => b.record_date.localeCompare(a.record_date)),
        }))
        return
      }
      if (!supabase) return
      await addRecord(supabase, circleId, input)
      await reload()
    },
    [mode, supabase, circleId, reload],
  )

  const remove = useCallback(
    async (recordId: string) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          records: prev.records.filter((r) => r.id !== recordId),
        }))
        return
      }
      if (!supabase) return
      await deleteRecord(supabase, recordId)
      await reload()
    },
    [mode, supabase, reload],
  )

  return { records: mode === 'demo' ? demo.records : records, isLoading, error, add, remove }
}
