import type {
  CostCategory,
  CostSplitType,
  CostEntryRow,
  CostShareRow,
  CostSettlementRow,
} from '@/lib/database.types'

export type { CostCategory, CostSplitType, CostEntryRow, CostShareRow, CostSettlementRow }

export const CATEGORY_OPTIONS: CostCategory[] = ['medication', 'diaper', 'caregiver', 'other']

export interface CostParticipantInput {
  userId: string
  userName: string
  shareCents: number
}

export interface NewCostEntry {
  description: string
  category: CostCategory
  amountCents: number
  expenseDate: string
  paidBy: string
  paidByName: string
  splitType: CostSplitType
  participants: CostParticipantInput[]
  notes?: string
}

export interface NewSettlement {
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  amountCents: number
  note?: string
}
