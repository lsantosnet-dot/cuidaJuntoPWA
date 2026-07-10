import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextArea, SegmentedControl } from '@/components/ui'
import {
  SLEEP_OPTIONS,
  APPETITE_OPTIONS,
  MOOD_OPTIONS,
  MOOD_EMOJI,
  type NewDiaryEntry,
  type SleepQuality,
  type Appetite,
  type Mood,
} from '../types'

interface AddDiaryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: NewDiaryEntry) => Promise<void>
}

export function AddDiaryForm({ isOpen, onClose, onSubmit }: AddDiaryFormProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [sleep, setSleep] = useState<SleepQuality | null>(null)
  const [appetite, setAppetite] = useState<Appetite | null>(null)
  const [mood, setMood] = useState<Mood | null>(null)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setContent('')
    setSleep(null)
    setAppetite(null)
    setMood(null)
  }

  const canSave = content.trim().length > 0 && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({ content: content.trim(), sleepQuality: sleep, appetite, mood })
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('diary.addTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('diary.fieldContent')}>
          {(id) => (
            <TextArea
              id={id}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              autoFocus
              required
            />
          )}
        </FormField>

        <FormField label={t('diary.mood.label')}>
          {() => (
            <SegmentedControl
              ariaLabel={t('diary.mood.label')}
              value={mood}
              onChange={setMood}
              segments={MOOD_OPTIONS.map((m) => ({ value: m, label: MOOD_EMOJI[m] }))}
            />
          )}
        </FormField>

        <FormField label={t('diary.sleepLabel')}>
          {() => (
            <SegmentedControl
              ariaLabel={t('diary.sleepLabel')}
              value={sleep}
              onChange={setSleep}
              segments={SLEEP_OPTIONS.map((s) => ({ value: s, label: t(`diary.sleep.${s}`) }))}
            />
          )}
        </FormField>

        <FormField label={t('diary.appetiteLabel')}>
          {() => (
            <SegmentedControl
              ariaLabel={t('diary.appetiteLabel')}
              value={appetite}
              onChange={setAppetite}
              segments={APPETITE_OPTIONS.map((a) => ({ value: a, label: t(`diary.appetite.${a}`) }))}
            />
          )}
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
