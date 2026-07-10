import { useCallback, useEffect, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { uuid } from '@/lib/id'
import { fetchDiary, addDiaryEntry } from './api'
import type { DiaryEntryRow, NewDiaryEntry } from './types'

export function useDiary() {
  const { mode, supabase, circleId, user } = useCareData()
  const demo = useDemoState()
  const [entries, setEntries] = useState<DiaryEntryRow[]>([])
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      setEntries(await fetchDiary(supabase, circleId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar diário')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const add = useCallback(
    async (entry: NewDiaryEntry) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          diary: [
            {
              id: uuid(),
              circle_id: circleId,
              author_id: user.id,
              author_name: user.name,
              content: entry.content,
              sleep_quality: entry.sleepQuality,
              appetite: entry.appetite,
              mood: entry.mood,
              created_at: new Date().toISOString(),
            },
            ...prev.diary,
          ],
        }))
        return
      }
      if (!supabase) return
      await addDiaryEntry(supabase, {
        circleId,
        authorId: user.id,
        authorName: user.name,
        entry,
      })
      await reload()
    },
    [mode, supabase, circleId, user, reload],
  )

  const list = mode === 'demo' ? demo.diary : entries

  return { entries: list, isLoading, error, add }
}
