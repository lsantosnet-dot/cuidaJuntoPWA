import type { AppSupabaseClient } from '@/lib/supabase'
import type { CostEntryRow, CostShareRow, CostSettlementRow, NewCostEntry, NewSettlement } from './types'

export async function fetchCostEntries(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<CostEntryRow[]> {
  const { data, error } = await supabase
    .from('cost_entries')
    .select('*')
    .eq('circle_id', circleId)
    .order('expense_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchCostShares(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<CostShareRow[]> {
  const { data, error } = await supabase.from('cost_shares').select('*').eq('circle_id', circleId)
  if (error) throw error
  return data ?? []
}

export async function fetchCostSettlements(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<CostSettlementRow[]> {
  const { data, error } = await supabase
    .from('cost_settlements')
    .select('*')
    .eq('circle_id', circleId)
    .order('settled_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addCostEntry(
  supabase: AppSupabaseClient,
  circleId: string,
  createdBy: string,
  input: NewCostEntry,
): Promise<void> {
  const { data, error } = await supabase
    .from('cost_entries')
    .insert({
      circle_id: circleId,
      description: input.description,
      category: input.category,
      amount_cents: input.amountCents,
      expense_date: input.expenseDate,
      paid_by: input.paidBy,
      paid_by_name: input.paidByName,
      split_type: input.splitType,
      notes: input.notes || null,
      created_by: createdBy,
    })
    .select('id')
    .single()
  if (error) throw error

  const { error: sharesError } = await supabase.from('cost_shares').insert(
    input.participants.map((p) => ({
      cost_entry_id: data.id,
      circle_id: circleId,
      user_id: p.userId,
      user_name: p.userName,
      share_cents: p.shareCents,
    })),
  )
  if (sharesError) throw sharesError
}

export async function deleteCostEntry(supabase: AppSupabaseClient, entryId: string): Promise<void> {
  const { error } = await supabase.from('cost_entries').delete().eq('id', entryId)
  if (error) throw error
}

export async function addSettlement(
  supabase: AppSupabaseClient,
  circleId: string,
  createdBy: string,
  input: NewSettlement,
): Promise<void> {
  const { error } = await supabase.from('cost_settlements').insert({
    circle_id: circleId,
    from_user_id: input.fromUserId,
    from_user_name: input.fromUserName,
    to_user_id: input.toUserId,
    to_user_name: input.toUserName,
    amount_cents: input.amountCents,
    note: input.note || null,
    created_by: createdBy,
  })
  if (error) throw error
}
