import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField, TextArea, Select } from '@/components/ui'
import { todayISODate } from '@/lib/datetime'
import {
  ATTACHMENT_ACCEPT,
  CATEGORY_OPTIONS,
  MAX_ATTACHMENT_BYTES,
  type NewRecord,
  type RecordCategory,
} from '../types'

interface AddRecordFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewRecord) => Promise<void>
}

export function AddRecordForm({ isOpen, onClose, onSubmit }: AddRecordFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<RecordCategory>('exam')
  const [date, setDate] = useState(todayISODate())
  const [details, setDetails] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const canSave = title.trim().length > 0 && date !== '' && !saving && !attachmentError

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > MAX_ATTACHMENT_BYTES) {
      setAttachment(null)
      setAttachmentError(t('history.attachmentTooLarge'))
      e.target.value = ''
      return
    }
    setAttachmentError(null)
    setAttachment(file)
  }

  const reset = () => {
    setTitle('')
    setCategory('exam')
    setDate(todayISODate())
    setDetails('')
    setAttachment(null)
    setAttachmentError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        category,
        recordDate: date,
        details: details.trim(),
        attachment,
      })
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('history.addTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('history.fieldTitle')}>
          {(id) => (
            <TextField id={id} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
          )}
        </FormField>
        <FormField label={t('history.fieldCategory')}>
          {(id) => (
            <Select
              id={id}
              value={category}
              onChange={(e) => {
                const next = e.target.value as RecordCategory
                setCategory(next)
                if (next !== 'document') {
                  setAttachment(null)
                  setAttachmentError(null)
                }
              }}
              options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: t(`history.category.${c}`) }))}
            />
          )}
        </FormField>
        <FormField label={t('history.fieldDate')}>
          {(id) => (
            <TextField id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          )}
        </FormField>
        <FormField label={t('history.fieldDetails')}>
          {(id) => <TextArea id={id} value={details} onChange={(e) => setDetails(e.target.value)} />}
        </FormField>
        {category === 'document' && (
          <FormField label={t('history.fieldAttachment')} hint={t('history.attachmentHint')}>
            {(id) => (
              <input
                id={id}
                type="file"
                accept={ATTACHMENT_ACCEPT}
                onChange={handleFileChange}
                className="block w-full text-base text-content file:mr-3 file:rounded-pill file:border-0 file:bg-surface-container file:px-4 file:py-2 file:text-base file:font-semibold file:text-content"
              />
            )}
          </FormField>
        )}
        {attachmentError && <p className="text-sm text-sos">{attachmentError}</p>}
        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" fullWidth disabled={!canSave}>
            {t('common.save')}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
