import type { AppSupabaseClient } from '@/lib/supabase'
import type { MedicalRecordRow, NewRecord } from './types'

export async function fetchRecords(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<MedicalRecordRow[]> {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('circle_id', circleId)
    .order('record_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addRecord(
  supabase: AppSupabaseClient,
  circleId: string,
  input: NewRecord,
): Promise<void> {
  const { error } = await supabase.from('medical_records').insert({
    circle_id: circleId,
    title: input.title,
    category: input.category,
    record_date: input.recordDate,
    details: input.details || null,
  })
  if (error) throw error
}
