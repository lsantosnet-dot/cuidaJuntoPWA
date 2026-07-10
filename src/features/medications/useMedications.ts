import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCareData } from '@/features/data/useCareData'
import { useDemoState, updateDemo } from '@/features/demo/demoStore'
import { uuid } from '@/lib/id'
import { buildDoses } from './doses'
import {
  fetchMedications,
  fetchTodayLogs,
  markDoseTaken,
  undoDose,
  addMedication as addMedicationApi,
} from './api'
import type { Dose, MedicationRow, MedicationLogRow, NewMedication } from './types'

export function useMedications() {
  const { mode, supabase, circleId, user } = useCareData()
  const demo = useDemoState()
  const [meds, setMeds] = useState<MedicationRow[]>([])
  const [logs, setLogs] = useState<MedicationLogRow[]>([])
  const [isLoading, setIsLoading] = useState(mode === 'supabase')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (mode !== 'supabase' || !supabase) return
    setIsLoading(true)
    setError(null)
    try {
      const [m, l] = await Promise.all([
        fetchMedications(supabase, circleId),
        fetchTodayLogs(supabase, circleId),
      ])
      setMeds(m)
      setLogs(l)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar remédios')
    } finally {
      setIsLoading(false)
    }
  }, [mode, supabase, circleId])

  useEffect(() => {
    void reload()
  }, [reload])

  const doses = useMemo<Dose[]>(
    () =>
      mode === 'demo'
        ? buildDoses(demo.medications, demo.medicationLogs)
        : buildDoses(meds, logs),
    [mode, demo.medications, demo.medicationLogs, meds, logs],
  )

  const markTaken = useCallback(
    async (dose: Dose) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          medicationLogs: [
            ...prev.medicationLogs,
            {
              id: uuid(),
              circle_id: circleId,
              medication_id: dose.medicationId,
              scheduled_for: dose.scheduledFor,
              status: 'taken',
              taken_at: new Date().toISOString(),
              taken_by: user.id,
              taken_by_name: user.name,
              created_at: new Date().toISOString(),
            },
          ],
        }))
        return
      }
      if (!supabase) return
      await markDoseTaken(supabase, {
        circleId,
        medicationId: dose.medicationId,
        scheduledFor: dose.scheduledFor,
        userId: user.id,
        userName: user.name,
      })
      await reload()
    },
    [mode, supabase, circleId, user, reload],
  )

  const undo = useCallback(
    async (dose: Dose) => {
      if (!dose.logId) return
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          medicationLogs: prev.medicationLogs.filter((l) => l.id !== dose.logId),
        }))
        return
      }
      if (!supabase) return
      await undoDose(supabase, dose.logId)
      await reload()
    },
    [mode, supabase, reload],
  )

  const addMedication = useCallback(
    async (input: NewMedication) => {
      if (mode === 'demo') {
        updateDemo((prev) => ({
          ...prev,
          medications: [
            ...prev.medications,
            {
              id: uuid(),
              circle_id: circleId,
              name: input.name,
              dosage: input.dosage || null,
              schedule_times: input.times,
              instructions: input.instructions || null,
              active: true,
              created_at: new Date().toISOString(),
            },
          ],
        }))
        return
      }
      if (!supabase) return
      await addMedicationApi(supabase, circleId, input)
      await reload()
    },
    [mode, supabase, circleId, reload],
  )

  return { doses, isLoading, error, markTaken, undo, addMedication }
}
