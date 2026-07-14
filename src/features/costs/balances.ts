import type { CostEntryRow, CostShareRow, CostSettlementRow } from './types'

export interface MemberBalance {
  userId: string
  userName: string
  /** Positive: the group owes this member. Negative: this member owes the group. */
  balanceCents: number
}

export interface SimplifiedDebt {
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  amountCents: number
}

/**
 * Net balance per member: what they fronted for the group, minus what they
 * owe for their own shares, adjusted by settlements already recorded.
 */
export function computeBalances(
  entries: CostEntryRow[],
  shares: CostShareRow[],
  settlements: CostSettlementRow[],
): MemberBalance[] {
  const balances = new Map<string, { name: string; cents: number }>()

  const bump = (userId: string, name: string | null, delta: number) => {
    const current = balances.get(userId)
    if (current) {
      current.cents += delta
      if (name) current.name = name
    } else {
      balances.set(userId, { name: name ?? userId, cents: delta })
    }
  }

  for (const entry of entries) bump(entry.paid_by, entry.paid_by_name, entry.amount_cents)
  for (const share of shares) bump(share.user_id, share.user_name, -share.share_cents)
  for (const settlement of settlements) {
    // A settlement pays down a debt: the debtor (from) owes less (balance
    // moves toward zero) and the creditor (to) is owed less.
    bump(settlement.from_user_id, settlement.from_user_name, settlement.amount_cents)
    bump(settlement.to_user_id, settlement.to_user_name, -settlement.amount_cents)
  }

  return Array.from(balances.entries())
    .map(([userId, v]) => ({ userId, userName: v.name, balanceCents: v.cents }))
    .sort((a, b) => b.balanceCents - a.balanceCents)
}

/**
 * Greedy min-cash-flow simplification (same idea as Splitwise): match the
 * biggest creditor with the biggest debtor until every balance is zeroed,
 * minimizing the number of "who pays whom" lines shown to the user.
 */
export function simplifyDebts(balances: MemberBalance[]): SimplifiedDebt[] {
  const creditors = balances
    .filter((b) => b.balanceCents > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balanceCents - a.balanceCents)
  const debtors = balances
    .filter((b) => b.balanceCents < 0)
    .map((b) => ({ ...b, balanceCents: -b.balanceCents }))
    .sort((a, b) => b.balanceCents - a.balanceCents)

  const result: SimplifiedDebt[] = []
  let ci = 0
  let di = 0
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    const amount = Math.min(creditor.balanceCents, debtor.balanceCents)
    if (amount > 0) {
      result.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amountCents: amount,
      })
    }
    creditor.balanceCents -= amount
    debtor.balanceCents -= amount
    if (creditor.balanceCents === 0) ci++
    if (debtor.balanceCents === 0) di++
  }
  return result
}

/**
 * Splits an amount evenly across participants in integer cents. Any leftover
 * cent from the division goes to the payer (or the first participant, if the
 * payer isn't one) so the shares always sum exactly to the total.
 */
export function splitEqually(
  amountCents: number,
  participantIds: string[],
  payerId: string,
): Record<string, number> {
  const count = participantIds.length
  const base = Math.floor(amountCents / count)
  const remainder = amountCents - base * count
  const shares: Record<string, number> = {}
  for (const id of participantIds) shares[id] = base
  const remainderTarget = participantIds.includes(payerId) ? payerId : participantIds[0]
  shares[remainderTarget] += remainder
  return shares
}
