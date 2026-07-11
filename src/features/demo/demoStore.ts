import { useSyncExternalStore } from 'react'
import { todayAtTime, todayISODate } from '@/lib/datetime'
import type {
  CareRecipientRow,
  MedicationRow,
  MedicationLogRow,
  DiaryEntryRow,
  ShiftRow,
  MembershipRow,
  InviteRow,
  MedicalRecordRow,
  CostEntryRow,
  CostShareRow,
  CostSettlementRow,
  RoutineItemRow,
  RoutineLogRow,
} from '@/lib/database.types'

/** Fixed ids so demo relations line up. */
export const DEMO_CIRCLE_ID = 'demo-circle'
export const DEMO_USER_ID = 'demo-user'

export interface DemoState {
  recipient: CareRecipientRow
  medications: MedicationRow[]
  medicationLogs: MedicationLogRow[]
  diary: DiaryEntryRow[]
  shifts: ShiftRow[]
  members: MembershipRow[]
  invites: InviteRow[]
  records: MedicalRecordRow[]
  costEntries: CostEntryRow[]
  costShares: CostShareRow[]
  costSettlements: CostSettlementRow[]
  routineItems: RoutineItemRow[]
  routineLogs: RoutineLogRow[]
}

const c = DEMO_CIRCLE_ID

function seed(): DemoState {
  return {
    recipient: {
      id: 'demo-recipient',
      circle_id: c,
      name: 'Sr. Antenor',
      photo_url: null,
      birth_date: '1945-03-12',
      conditions: ['Diabetes Tipo 2', 'Hipertensão'],
      notes: 'Usa óculos para leitura. Prefere caminhar de manhã.',
      updated_at: new Date().toISOString(),
    },
    medications: [
      { id: 'm1', circle_id: c, name: 'Metformina', dosage: '850 mg', schedule_times: ['08:00', '20:00'], instructions: 'Tomar após as refeições.', active: true, created_at: new Date().toISOString() },
      { id: 'm2', circle_id: c, name: 'Losartana', dosage: '50 mg', schedule_times: ['08:00'], instructions: null, active: true, created_at: new Date().toISOString() },
      { id: 'm3', circle_id: c, name: 'Insulina NPH', dosage: '10 UI', schedule_times: ['12:00'], instructions: 'Antes do almoço.', active: true, created_at: new Date().toISOString() },
    ],
    // Only taken doses are logged; a pending dose is simply the absence of a
    // log for that medication + time (the 12:00 and 20:00 doses below).
    medicationLogs: [
      { id: 'l1', circle_id: c, medication_id: 'm1', scheduled_for: todayAtTime('08:00'), status: 'taken', taken_at: todayAtTime('08:10'), taken_by: DEMO_USER_ID, taken_by_name: 'Você', created_at: todayAtTime('08:00') },
      { id: 'l2', circle_id: c, medication_id: 'm2', scheduled_for: todayAtTime('08:00'), status: 'taken', taken_at: todayAtTime('08:10'), taken_by: DEMO_USER_ID, taken_by_name: 'Você', created_at: todayAtTime('08:00') },
    ],
    diary: [
      { id: 'd1', circle_id: c, author_id: 'u-ana', author_name: 'Ana (cuidadora)', content: 'Dormiu bem à noite, acordou disposto. Tomou café da manhã completo.', sleep_quality: 'good', appetite: 'normal', mood: 'great', created_at: todayAtTime('08:30') },
      { id: 'd2', circle_id: c, author_id: 'u-carlos', author_name: 'Carlos (filho)', content: 'Ficou um pouco agitado à tarde, mas melhorou depois da caminhada.', sleep_quality: null, appetite: 'low', mood: 'ok', created_at: todayAtTime('16:00') },
    ],
    shifts: [
      { id: 's1', circle_id: c, caregiver_id: 'u-ana', caregiver_name: 'Ana (cuidadora)', starts_at: todayAtTime('07:00'), ends_at: todayAtTime('19:00'), status: 'active', notes: null, created_at: todayAtTime('07:00') },
      { id: 's2', circle_id: c, caregiver_id: 'u-carlos', caregiver_name: 'Carlos (filho)', starts_at: todayAtTime('19:00'), ends_at: null, status: 'scheduled', notes: 'Plantão noturno', created_at: todayAtTime('07:00') },
    ],
    members: [
      { id: 'mb1', circle_id: c, user_id: DEMO_USER_ID, role: 'admin', display_name: 'Você', email: null, avatar_url: null, created_at: new Date().toISOString() },
      { id: 'mb2', circle_id: c, user_id: 'u-ana', role: 'caregiver', display_name: 'Ana', email: 'ana@exemplo.com', avatar_url: null, created_at: new Date().toISOString() },
      { id: 'mb3', circle_id: c, user_id: 'u-carlos', role: 'family', display_name: 'Carlos', email: 'carlos@exemplo.com', avatar_url: null, created_at: new Date().toISOString() },
    ],
    invites: [
      { id: 'i1', circle_id: c, email: 'maria@exemplo.com', role: 'family', status: 'pending', invited_by: DEMO_USER_ID, token: 'demo-invite-token', created_at: new Date().toISOString() },
    ],
    records: [
      { id: 'r1', circle_id: c, title: 'Hemograma completo', category: 'exam', record_date: '2026-06-28', details: 'Resultados dentro do esperado. Glicemia levemente elevada.', attachment_url: null, created_at: new Date().toISOString() },
      { id: 'r2', circle_id: c, title: 'Consulta com cardiologista', category: 'appointment', record_date: '2026-06-15', details: 'Ajuste da dose de Losartana. Retorno em 3 meses.', attachment_url: null, created_at: new Date().toISOString() },
    ],
    // Diaper split 3 ways, medication and the caregiver's day split between
    // the two family members — Ana is paid, not one of the debtors.
    costEntries: [
      { id: 'ce1', circle_id: c, description: 'Fraldas geriátricas (pacote)', category: 'diaper', amount_cents: 12000, currency: 'BRL', expense_date: '2026-07-08', paid_by: 'u-carlos', paid_by_name: 'Carlos', split_type: 'equal', notes: null, created_by: 'u-carlos', created_at: todayAtTime('09:00') },
      { id: 'ce2', circle_id: c, description: 'Farmácia — Metformina e Losartana', category: 'medication', amount_cents: 8550, currency: 'BRL', expense_date: '2026-07-09', paid_by: DEMO_USER_ID, paid_by_name: 'Você', split_type: 'equal', notes: null, created_by: DEMO_USER_ID, created_at: todayAtTime('10:00') },
      { id: 'ce3', circle_id: c, description: 'Diária da cuidadora Ana', category: 'caregiver', amount_cents: 15000, currency: 'BRL', expense_date: '2026-07-10', paid_by: 'u-carlos', paid_by_name: 'Carlos', split_type: 'equal', notes: 'Pago em dinheiro no fim do plantão.', created_by: 'u-carlos', created_at: todayAtTime('11:00') },
    ],
    costShares: [
      { id: 'cs1', cost_entry_id: 'ce1', circle_id: c, user_id: DEMO_USER_ID, user_name: 'Você', share_cents: 4000, created_at: todayAtTime('09:00') },
      { id: 'cs2', cost_entry_id: 'ce1', circle_id: c, user_id: 'u-ana', user_name: 'Ana', share_cents: 4000, created_at: todayAtTime('09:00') },
      { id: 'cs3', cost_entry_id: 'ce1', circle_id: c, user_id: 'u-carlos', user_name: 'Carlos', share_cents: 4000, created_at: todayAtTime('09:00') },
      { id: 'cs4', cost_entry_id: 'ce2', circle_id: c, user_id: DEMO_USER_ID, user_name: 'Você', share_cents: 4275, created_at: todayAtTime('10:00') },
      { id: 'cs5', cost_entry_id: 'ce2', circle_id: c, user_id: 'u-carlos', user_name: 'Carlos', share_cents: 4275, created_at: todayAtTime('10:00') },
      { id: 'cs6', cost_entry_id: 'ce3', circle_id: c, user_id: DEMO_USER_ID, user_name: 'Você', share_cents: 7500, created_at: todayAtTime('11:00') },
      { id: 'cs7', cost_entry_id: 'ce3', circle_id: c, user_id: 'u-carlos', user_name: 'Carlos', share_cents: 7500, created_at: todayAtTime('11:00') },
    ],
    costSettlements: [],
    routineItems: [
      { id: 'ri1', circle_id: c, type: 'bath', name: 'Banho', target_count_per_day: 1, notes: null, active: true, created_at: new Date().toISOString() },
      { id: 'ri2', circle_id: c, type: 'meal', name: 'Almoço', target_count_per_day: 1, notes: null, active: true, created_at: new Date().toISOString() },
      { id: 'ri3', circle_id: c, type: 'hydration', name: 'Hidratação', target_count_per_day: 3, notes: null, active: true, created_at: new Date().toISOString() },
    ],
    routineLogs: [
      { id: 'rl1', circle_id: c, routine_item_id: 'ri1', log_date: todayISODate(), completed_at: todayAtTime('08:15'), completed_by: DEMO_USER_ID, completed_by_name: 'Você', created_at: todayAtTime('08:15') },
      { id: 'rl2', circle_id: c, routine_item_id: 'ri3', log_date: todayISODate(), completed_at: todayAtTime('09:00'), completed_by: DEMO_USER_ID, completed_by_name: 'Você', created_at: todayAtTime('09:00') },
    ],
  }
}

let state: DemoState = seed()
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

export function subscribeDemo(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getDemoState(): DemoState {
  return state
}

/** Applies an immutable update and notifies subscribers. */
export function updateDemo(updater: (prev: DemoState) => DemoState): void {
  state = updater(state)
  emit()
}

/** Reactive hook over the demo store. */
export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribeDemo, getDemoState, getDemoState)
}
