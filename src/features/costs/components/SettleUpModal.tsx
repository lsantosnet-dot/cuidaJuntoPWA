import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField } from '@/components/ui'
import { toCents } from '@/lib/money'
import type { SimplifiedDebt } from '../balances'
import type { NewSettlement } from '../types'

interface SettleUpModalProps {
  debt: SimplifiedDebt | null
  onClose: () => void
  onConfirm: (input: NewSettlement) => Promise<void>
}

export function SettleUpModal({ debt, onClose, onConfirm }: SettleUpModalProps) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (debt) setAmount((debt.amountCents / 100).toFixed(2))
    setNote('')
  }, [debt])

  if (!debt) return null

  const amountCents = toCents(Number(amount.replace(',', '.')) || 0)
  const canSave = amountCents > 0 && amountCents <= debt.amountCents && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onConfirm({
        fromUserId: debt.fromUserId,
        fromUserName: debt.fromUserName,
        toUserId: debt.toUserId,
        toUserName: debt.toUserName,
        amountCents,
        note: note.trim(),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('costs.settleTitle', { from: debt.fromUserName, to: debt.toUserName })}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('costs.fieldAmount')}>
          {(id) => (
            <TextField
              id={id}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          )}
        </FormField>
        <FormField label={t('costs.fieldNotes')} hint={t('common.optional')}>
          {(id) => <TextField id={id} value={note} onChange={(e) => setNote(e.target.value)} />}
        </FormField>
        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" fullWidth disabled={!canSave}>
            {t('costs.confirmSettle')}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
