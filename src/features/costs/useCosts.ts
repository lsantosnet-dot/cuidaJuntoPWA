import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { useTeam } from '@/features/team'
import { uuid } from '@/lib/id'
import {
  fetchCostEntries,
  fetchCostShares,
  fetchCostSettlements,
  addCostEntry,
  deleteCostEntry,
  addSettlement,
} from './api'
import { computeBalances, simplifyDebts } from './balances'
import type { CostEntryRow, CostShareRow, CostSettlementRow, NewCostEntry, NewSettlement } from './types'

export function useCosts() {
  const { mode, supabase, circleId, user } = useCareData()
  const { members } = useTeam()
  const demo = useDemoState()
  const [entries, setEntries] = useState<CostEntryRow[]>([])
  const [shares, setShares] = useState<CostShareRow[]>([])
  const [settlements, setSettlements] = useState<CostSettlementRow[]>([])
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      const [e, s, st] = await Promise.all([
        fetchCostEntries(supabase, circleId),
        fetchCostShares(supabase, circleId),
        fetchCostSettlements(supabase, circleId),
      ])
      setEntries(e)
      setShares(s)
      setSettlements(st)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar custos')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const list = mode === 'demo' ? demo.costEntries : entries
  const shareList = mode === 'demo' ? demo.costShares : shares
  const settlementList = mode === 'demo' ? demo.costSettlements : settlements

  const balances = useMemo(
    () => computeBalances(list, shareList, settlementList),
    [list, shareList, settlementList],
  )
  const simplifiedDebts = useMemo(() => simplifyDebts(balances), [balances])

  const add = useCallback(
    async (input: NewCostEntry) => {
      if (mode === 'demo') {
        const entryId = uuid()
        const now = new Date().toISOString()
        const newEntry: CostEntryRow = {
          id: entryId,
          circle_id: circleId,
          description: input.description,
          category: input.category,
          amount_cents: input.amountCents,
          currency: 'BRL',
          expense_date: input.expenseDate,
          paid_by: input.paidBy,
          paid_by_name: input.paidByName,
          split_type: input.splitType,
          notes: input.notes || null,
          created_by: user.id,
          created_at: now,
        }
        const newShares: CostShareRow[] = input.participants.map((p) => ({
          id: uuid(),
          cost_entry_id: entryId,
          circle_id: circleId,
          user_id: p.userId,
          user_name: p.userName,
          share_cents: p.shareCents,
          created_at: now,
        }))
        updateDemo((prev) => ({
          ...prev,
          costEntries: [newEntry, ...prev.costEntries],
          costShares: [...prev.costShares, ...newShares],
        }))
        return
      }
      if (!supabase) return
      await addCostEntry(supabase, circleId, user.id, input)
      await reload()
    },
    [mode, supabase, circleId, user, reload],
  )

  const remove = useCallback(
    async (entryId: string) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          costEntries: prev.costEntries.filter((e) => e.id !== entryId),
          costShares: prev.costShares.filter((s) => s.cost_entry_id !== entryId),
        }))
        return
      }
      if (!supabase) return
      await deleteCostEntry(supabase, entryId)
      await reload()
    },
    [mode, supabase, reload],
  )

  const settle = useCallback(
    async (input: NewSettlement) => {
      if (mode === 'demo') {
        const now = new Date().toISOString()
        updateDemo((prev) => ({
          ...prev,
          costSettlements: [
            {
              id: uuid(),
              circle_id: circleId,
              from_user_id: input.fromUserId,
              from_user_name: input.fromUserName,
              to_user_id: input.toUserId,
              to_user_name: input.toUserName,
              amount_cents: input.amountCents,
              note: input.note || null,
              settled_at: now,
              created_by: user.id,
              created_at: now,
            },
            ...prev.costSettlements,
          ],
        }))
        return
      }
      if (!supabase) return
      await addSettlement(supabase, circleId, user.id, input)
      await reload()
    },
    [mode, supabase, circleId, user, reload],
  )

  return {
    entries: list,
    shares: shareList,
    settlements: settlementList,
    members,
    isLoading,
    error,
    balances,
    simplifiedDebts,
    add,
    remove,
    settle,
    currentUserId: user.id,
  }
}
