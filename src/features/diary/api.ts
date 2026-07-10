import type { AppSupabaseClient } from '@/lib/supabase'
import type { DiaryEntryRow, NewDiaryEntry } from './types'

export async function fetchDiary(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<DiaryEntryRow[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addDiaryEntry(
  supabase: AppSupabaseClient,
  input: { circleId: string; authorId: string; authorName: string; entry: NewDiaryEntry },
): Promise<void> {
  const { error } = await supabase.from('diary_entries').insert({
    circle_id: input.circleId,
    author_id: input.authorId,
    author_name: input.authorName,
    content: input.entry.content,
    sleep_quality: input.entry.sleepQuality,
    appetite: input.entry.appetite,
    mood: input.entry.mood,
  })
  if (error) throw error
}
