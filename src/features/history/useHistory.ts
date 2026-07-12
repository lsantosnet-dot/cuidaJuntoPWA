import { useCallback, useEffect, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { uuid } from '@/lib/id'
import { fetchRecords, addRecord, deleteRecord, getAttachmentDownloadUrl } from './api'
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
              attachment_url: input.attachment ? URL.createObjectURL(input.attachment) : null,
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
    async (record: MedicalRecordRow) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          records: prev.records.filter((r) => r.id !== record.id),
        }))
        return
      }
      if (!supabase) return
      await deleteRecord(supabase, record.id, record.attachment_url)
      await reload()
    },
    [mode, supabase, reload],
  )

  const getDownloadUrl = useCallback(
    async (record: MedicalRecordRow): Promise<string | null> => {
      if (!record.attachment_url) return null
      if (mode === 'demo' || !supabase) return record.attachment_url
      return getAttachmentDownloadUrl(supabase, record.attachment_url)
    },
    [mode, supabase],
  )

  return {
    records: mode === 'demo' ? demo.records : records,
    isLoading,
    error,
    add,
    remove,
    getDownloadUrl,
  }
}
