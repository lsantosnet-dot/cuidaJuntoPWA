import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Modal,
  Button,
  FormField,
  TextField,
  TextArea,
  Select,
  SegmentedControl,
} from '@/components/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { todayISODate } from '@/lib/datetime'
import { formatCurrency, toCents } from '@/lib/money'
import { splitEqually } from '../balances'
import { CATEGORY_OPTIONS, type CostCategory, type CostSplitType, type NewCostEntry } from '../types'
import type { MembershipRow } from '@/lib/database.types'

interface AddCostFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewCostEntry) => Promise<void>
  members: MembershipRow[]
  currentUserId: string
}

function memberName(member: MembershipRow): string {
  return member.display_name ?? member.email ?? member.user_id
}

export function AddCostForm({ isOpen, onClose, onSubmit, members, currentUserId }: AddCostFormProps) {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<CostCategory>('other')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISODate())
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitType, setSplitType] = useState<CostSplitType>('equal')
  const [participantIds, setParticipantIds] = useState<Set<string>>(
    () => new Set(members.map((m) => m.user_id)),
  )
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const amountCents = toCents(Number(amount.replace(',', '.')) || 0)

  const reset = () => {
    setDescription('')
    setCategory('other')
    setAmount('')
    setDate(todayISODate())
    setPaidBy(currentUserId)
    setSplitType('equal')
    setParticipantIds(new Set(members.map((m) => m.user_id)))
    setCustomAmounts({})
    setNotes('')
  }

  const toggleParticipant = (userId: string) => {
    setParticipantIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const customTotalCents = useMemo(
    () =>
      Object.values(customAmounts).reduce(
        (sum, v) => sum + toCents(Number(v.replace(',', '.')) || 0),
        0,
      ),
    [customAmounts],
  )
  const customDiffCents = amountCents - customTotalCents

  const canSave =
    description.trim().length > 0 &&
    amountCents > 0 &&
    date !== '' &&
    paidBy !== '' &&
    (splitType === 'equal' ? participantIds.size > 0 : customDiffCents === 0 && customTotalCents > 0) &&
    !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      const payer = members.find((m) => m.user_id === paidBy)
      const participants =
        splitType === 'equal'
          ? Object.entries(splitEqually(amountCents, Array.from(participantIds), paidBy)).map(
              ([userId, shareCents]) => {
                const member = members.find((m) => m.user_id === userId)
                return { userId, userName: member ? memberName(member) : userId, shareCents }
              },
            )
          : members
              .filter((m) => toCents(Number((customAmounts[m.user_id] ?? '').replace(',', '.')) || 0) > 0)
              .map((m) => ({
                userId: m.user_id,
                userName: memberName(m),
                shareCents: toCents(Number((customAmounts[m.user_id] ?? '').replace(',', '.')) || 0),
              }))

      await onSubmit({
        description: description.trim(),
        category,
        amountCents,
        expenseDate: date,
        paidBy,
        paidByName: payer ? memberName(payer) : paidBy,
        splitType,
        participants,
        notes: notes.trim(),
      })
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('costs.addTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('costs.fieldDescription')}>
          {(id) => (
            <TextField
              id={id}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
              required
            />
          )}
        </FormField>
        <FormField label={t('costs.fieldCategory')}>
          {(id) => (
            <Select
              id={id}
              value={category}
              onChange={(e) => setCategory(e.target.value as CostCategory)}
              options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: t(`costs.category.${c}`) }))}
            />
          )}
        </FormField>
        <FormField label={t('costs.fieldAmount')}>
          {(id) => (
            <TextField
              id={id}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          )}
        </FormField>
        <FormField label={t('costs.fieldDate')}>
          {(id) => (
            <TextField id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          )}
        </FormField>
        <FormField label={t('costs.fieldPaidBy')}>
          {(id) => (
            <Select
              id={id}
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              options={members.map((m) => ({ value: m.user_id, label: memberName(m) }))}
            />
          )}
        </FormField>

        <FormField label={t('costs.fieldSplit')}>
          {() => (
            <SegmentedControl
              ariaLabel={t('costs.fieldSplit')}
              value={splitType}
              onChange={setSplitType}
              segments={[
                { value: 'equal', label: t('costs.splitEqual') },
                { value: 'custom', label: t('costs.splitCustom') },
              ]}
            />
          )}
        </FormField>

        {splitType === 'equal' ? (
          <FormField label={t('costs.fieldParticipants')}>
            {() => (
              <div className="flex flex-col gap-2">
                {members.map((m) => (
                  <label
                    key={m.user_id}
                    className="flex min-h-touch items-center gap-3 rounded-input border-[1.5px] border-outline-variant px-4"
                  >
                    <input
                      type="checkbox"
                      checked={participantIds.has(m.user_id)}
                      onChange={() => toggleParticipant(m.user_id)}
                      className="h-5 w-5 accent-primary"
                    />
                    <span className="text-base text-content">{memberName(m)}</span>
                  </label>
                ))}
              </div>
            )}
          </FormField>
        ) : (
          <FormField
            label={t('costs.fieldParticipants')}
            hint={
              customDiffCents === 0
                ? undefined
                : customDiffCents > 0
                  ? t('costs.splitMissing', { amount: formatCurrency(customDiffCents, current) })
                  : t('costs.splitOver', { amount: formatCurrency(-customDiffCents, current) })
            }
          >
            {() => (
              <div className="flex flex-col gap-2">
                {members.map((m) => (
                  <div key={m.user_id} className="flex items-center gap-3">
                    <span className="flex-1 text-base text-content">{memberName(m)}</span>
                    <TextField
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      className="w-28"
                      value={customAmounts[m.user_id] ?? ''}
                      onChange={(e) =>
                        setCustomAmounts((prev) => ({ ...prev, [m.user_id]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </FormField>
        )}

        <FormField label={t('costs.fieldNotes')} hint={t('common.optional')}>
          {(id) => <TextArea id={id} value={notes} onChange={(e) => setNotes(e.target.value)} />}
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
