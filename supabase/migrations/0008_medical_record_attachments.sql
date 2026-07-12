-- Storage bucket for medical record attachments (documents/exam files).
-- Private bucket: files are served via short-lived signed URLs, never public
-- links, since these are sensitive health documents.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medical-attachments',
  'medical-attachments',
  false,
  10485760, -- 10 MB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Objects are stored under `${circle_id}/...`; policies mirror medical_records_all
-- by checking circle membership on the first path segment.
create policy medical_attachments_select on storage.objects
  for select using (
    bucket_id = 'medical-attachments'
    and public.is_circle_member((storage.foldername(name))[1]::uuid)
  );

create policy medical_attachments_insert on storage.objects
  for insert with check (
    bucket_id = 'medical-attachments'
    and public.is_circle_member((storage.foldername(name))[1]::uuid)
  );

create policy medical_attachments_delete on storage.objects
  for delete using (
    bucket_id = 'medical-attachments'
    and public.is_circle_member((storage.foldername(name))[1]::uuid)
  );
