import { useCallback, useEffect, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { fetchRecipient, saveRecipient } from './api'
import type { CareRecipientRow, EditRecipient } from './types'

export function useProfile() {
  const { mode, supabase, circleId } = useCareData()
  const demo = useDemoState()
  const [recipient, setRecipient] = useState<CareRecipientRow | null>(null)
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      setRecipient(await fetchRecipient(supabase, circleId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar perfil')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(
    async (input: EditRecipient) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          recipient: {
            ...prev.recipient,
            name: input.name,
            conditions: input.conditions,
            notes: input.notes || null,
            birth_date: input.birthDate,
            updated_at: new Date().toISOString(),
          },
        }))
        return
      }
      if (!supabase) return
      await saveRecipient(supabase, circleId, input)
      await reload()
    },
    [mode, supabase, circleId, reload],
  )

  return { recipient: mode === 'demo' ? demo.recipient : recipient, isLoading, error, save }
}
