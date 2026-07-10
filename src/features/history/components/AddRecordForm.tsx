import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField, TextArea, Select } from '@/components/ui'
import { todayISODate } from '@/lib/datetime'
import { CATEGORY_OPTIONS, type NewRecord, type RecordCategory } from '../types'

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
  const [saving, setSaving] = useState(false)

  const canSave = title.trim().length > 0 && date !== '' && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), category, recordDate: date, details: details.trim() })
      setTitle('')
      setCategory('exam')
      setDate(todayISODate())
      setDetails('')
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
              onChange={(e) => setCategory(e.target.value as RecordCategory)}
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
