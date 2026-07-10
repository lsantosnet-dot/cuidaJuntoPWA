import type { AppSupabaseClient } from '@/lib/supabase'
import type { CareRecipientRow, EditRecipient } from './types'

export async function fetchRecipient(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<CareRecipientRow | null> {
  const { data, error } = await supabase
    .from('care_recipients')
    .select('*')
    .eq('circle_id', circleId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Upsert keyed on the circle's unique recipient row. */
export async function saveRecipient(
  supabase: AppSupabaseClient,
  circleId: string,
  input: EditRecipient,
): Promise<void> {
  const { error } = await supabase.from('care_recipients').upsert(
    {
      circle_id: circleId,
      name: input.name,
      conditions: input.conditions,
      notes: input.notes || null,
      birth_date: input.birthDate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'circle_id' },
  )
  if (error) throw error
}
