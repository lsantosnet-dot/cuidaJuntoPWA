import type { DiaryEntryRow, SleepQuality, Appetite, Mood } from '@/lib/database.types'

export type { DiaryEntryRow, SleepQuality, Appetite, Mood }

export const SLEEP_OPTIONS: SleepQuality[] = ['good', 'restless', 'interrupted']
export const APPETITE_OPTIONS: Appetite[] = ['low', 'normal', 'high']
export const MOOD_OPTIONS: Mood[] = ['great', 'ok', 'down', 'irritated', 'sleepy']

export const MOOD_EMOJI: Record<Mood, string> = {
  great: '😊',
  ok: '😐',
  down: '😔',
  irritated: '😠',
  sleepy: '😴',
}

export interface NewDiaryEntry {
  content: string
  sleepQuality: SleepQuality | null
  appetite: Appetite | null
  mood: Mood | null
}
