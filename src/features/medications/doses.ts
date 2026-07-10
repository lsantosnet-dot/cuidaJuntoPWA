import { todayAtTime } from '@/lib/datetime'
import type { Dose, MedicationRow, MedicationLogRow } from './types'

function sameClock(iso: string, time: string): boolean {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}` === time
}

/**
 * Expands active medications into today's doses, matching each scheduled time
 * against an existing log to resolve its status. Pure — shared by both the
 * Supabase and demo data paths.
 */
export function buildDoses(meds: MedicationRow[], logs: MedicationLogRow[]): Dose[] {
  const doses: Dose[] = []

  for (const med of meds) {
    if (!med.active) continue
    for (const time of med.schedule_times) {
      // A dose is "taken" only if a taken log exists for it; absence = pending.
      // We match the taken log specifically so a stray pending log never masks it.
      const taken = logs.find(
        (l) =>
          l.medication_id === med.id &&
          l.status === 'taken' &&
          sameClock(l.scheduled_for, time),
      )
      doses.push({
        key: `${med.id}-${time}`,
        medicationId: med.id,
        name: med.name,
        dosage: med.dosage,
        instructions: med.instructions,
        time,
        scheduledFor: taken?.scheduled_for ?? todayAtTime(time),
        status: taken ? 'taken' : 'pending',
        logId: taken?.id,
        takenByName: taken?.taken_by_name,
        takenAt: taken?.taken_at,
      })
    }
  }

  return doses.sort((a, b) => a.time.localeCompare(b.time))
}
