import type { AppSupabaseClient } from '@/lib/supabase'
import { uuid } from '@/lib/id'
import type { MedicalRecordRow, NewRecord } from './types'

const ATTACHMENTS_BUCKET = 'medical-attachments'

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

export async function deleteRecord(
  supabase: AppSupabaseClient,
  recordId: string,
  attachmentPath: string | null,
): Promise<void> {
  const { error } = await supabase.from('medical_records').delete().eq('id', recordId)
  if (error) throw error
  if (attachmentPath) {
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([attachmentPath])
  }
}

async function uploadAttachment(
  supabase: AppSupabaseClient,
  circleId: string,
  file: File,
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const path = `${circleId}/${uuid()}-${safeName}`
  const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export async function addRecord(
  supabase: AppSupabaseClient,
  circleId: string,
  input: NewRecord,
): Promise<void> {
  const attachmentPath = input.attachment
    ? await uploadAttachment(supabase, circleId, input.attachment)
    : null
  const { error } = await supabase.from('medical_records').insert({
    circle_id: circleId,
    title: input.title,
    category: input.category,
    record_date: input.recordDate,
    details: input.details || null,
    attachment_url: attachmentPath,
  })
  if (error) throw error
}

export async function getAttachmentDownloadUrl(
  supabase: AppSupabaseClient,
  attachmentPath: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(attachmentPath, 60)
  if (error) throw error
  return data.signedUrl
}
