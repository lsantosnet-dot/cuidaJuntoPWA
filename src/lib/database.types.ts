/**
 * Typed shape of the Supabase schema, mirroring supabase/migrations.
 *
 * Row shapes are `type` aliases (not interfaces) on purpose: supabase-js checks
 * that each table conforms to `Record<string, unknown>`, and only type aliases
 * get the implicit index signature that check needs.
 *
 * Hand-maintained for now. Once the Supabase CLI is set up it can be
 * regenerated with:
 *   supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */

export type MembershipRole = 'admin' | 'family' | 'caregiver'
export type MedLogStatus = 'pending' | 'taken' | 'skipped'
export type SleepQuality = 'good' | 'restless' | 'interrupted'
export type Appetite = 'low' | 'normal' | 'high'
export type Mood = 'great' | 'ok' | 'down' | 'irritated' | 'sleepy'
export type RecordCategory = 'exam' | 'appointment' | 'document' | 'note'
export type ShiftStatus = 'scheduled' | 'active' | 'ended'
export type InviteStatus = 'pending' | 'accepted' | 'revoked'
export type CostCategory = 'medication' | 'diaper' | 'caregiver' | 'other'
export type CostSplitType = 'equal' | 'custom'
export type RoutineType = 'bath' | 'meal' | 'hydration' | 'other'

interface Table<Row, Insert, Update> {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type CareCircleRow = {
  id: string
  name: string
  created_by: string
  created_at: string
}

export type MembershipRow = {
  id: string
  circle_id: string
  user_id: string
  role: MembershipRole
  display_name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
}

export type CareRecipientRow = {
  id: string
  circle_id: string
  name: string
  photo_url: string | null
  birth_date: string | null
  conditions: string[]
  notes: string | null
  updated_at: string
}

export type MedicationRow = {
  id: string
  circle_id: string
  name: string
  dosage: string | null
  schedule_times: string[]
  instructions: string | null
  active: boolean
  created_at: string
}

export type MedicationLogRow = {
  id: string
  circle_id: string
  medication_id: string
  scheduled_for: string
  status: MedLogStatus
  taken_at: string | null
  taken_by: string | null
  taken_by_name: string | null
  created_at: string
}

export type DiaryEntryRow = {
  id: string
  circle_id: string
  author_id: string
  author_name: string | null
  content: string
  sleep_quality: SleepQuality | null
  appetite: Appetite | null
  mood: Mood | null
  created_at: string
}

export type ShiftRow = {
  id: string
  circle_id: string
  caregiver_id: string | null
  caregiver_name: string | null
  starts_at: string
  ends_at: string | null
  status: ShiftStatus
  notes: string | null
  created_at: string
}

export type MedicalRecordRow = {
  id: string
  circle_id: string
  title: string
  category: RecordCategory
  record_date: string
  details: string | null
  attachment_url: string | null
  created_at: string
}

export type InviteRow = {
  id: string
  circle_id: string
  email: string
  role: MembershipRole
  status: InviteStatus
  invited_by: string
  token: string
  created_at: string
}

export type PushSubscriptionRow = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string | null
  created_at: string
}

export type CostEntryRow = {
  id: string
  circle_id: string
  description: string
  category: CostCategory
  amount_cents: number
  currency: string
  expense_date: string
  paid_by: string
  paid_by_name: string | null
  split_type: CostSplitType
  notes: string | null
  created_by: string
  created_at: string
}

export type CostShareRow = {
  id: string
  cost_entry_id: string
  circle_id: string
  user_id: string
  user_name: string | null
  share_cents: number
  created_at: string
}

export type CostSettlementRow = {
  id: string
  circle_id: string
  from_user_id: string
  from_user_name: string | null
  to_user_id: string
  to_user_name: string | null
  amount_cents: number
  note: string | null
  settled_at: string
  created_by: string
  created_at: string
}

export type RoutineItemRow = {
  id: string
  circle_id: string
  type: RoutineType
  name: string
  target_count_per_day: number
  notes: string | null
  active: boolean
  created_at: string
}

export type RoutineLogRow = {
  id: string
  circle_id: string
  routine_item_id: string
  log_date: string
  completed_at: string
  completed_by: string
  completed_by_name: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      care_circles: Table<CareCircleRow, Partial<CareCircleRow> & { name: string; created_by: string }, Partial<CareCircleRow>>
      memberships: Table<MembershipRow, Partial<MembershipRow> & { circle_id: string; user_id: string }, Partial<MembershipRow>>
      care_recipients: Table<CareRecipientRow, Partial<CareRecipientRow> & { circle_id: string; name: string }, Partial<CareRecipientRow>>
      medications: Table<MedicationRow, Partial<MedicationRow> & { circle_id: string; name: string }, Partial<MedicationRow>>
      medication_logs: Table<MedicationLogRow, Partial<MedicationLogRow> & { circle_id: string; medication_id: string; scheduled_for: string }, Partial<MedicationLogRow>>
      diary_entries: Table<DiaryEntryRow, Partial<DiaryEntryRow> & { circle_id: string; author_id: string; content: string }, Partial<DiaryEntryRow>>
      shifts: Table<ShiftRow, Partial<ShiftRow> & { circle_id: string; starts_at: string }, Partial<ShiftRow>>
      medical_records: Table<MedicalRecordRow, Partial<MedicalRecordRow> & { circle_id: string; title: string }, Partial<MedicalRecordRow>>
      invites: Table<InviteRow, Partial<InviteRow> & { circle_id: string; email: string; invited_by: string }, Partial<InviteRow>>
      push_subscriptions: Table<PushSubscriptionRow, Partial<PushSubscriptionRow> & { user_id: string; endpoint: string; p256dh: string; auth: string }, Partial<PushSubscriptionRow>>
      cost_entries: Table<CostEntryRow, Partial<CostEntryRow> & { circle_id: string; description: string; amount_cents: number; paid_by: string; created_by: string }, Partial<CostEntryRow>>
      cost_shares: Table<CostShareRow, Partial<CostShareRow> & { cost_entry_id: string; circle_id: string; user_id: string; share_cents: number }, Partial<CostShareRow>>
      cost_settlements: Table<CostSettlementRow, Partial<CostSettlementRow> & { circle_id: string; from_user_id: string; to_user_id: string; amount_cents: number; created_by: string }, Partial<CostSettlementRow>>
      routine_items: Table<RoutineItemRow, Partial<RoutineItemRow> & { circle_id: string; name: string }, Partial<RoutineItemRow>>
      routine_logs: Table<RoutineLogRow, Partial<RoutineLogRow> & { circle_id: string; routine_item_id: string; completed_by: string }, Partial<RoutineLogRow>>
    }
    Views: Record<never, never>
    Functions: {
      create_care_circle: {
        Args: { circle_name: string; recipient_name: string | null }
        Returns: string
      }
      get_invite: {
        Args: { invite_token: string }
        Returns: {
          circle_id: string
          circle_name: string
          role: MembershipRole
          status: InviteStatus
        }[]
      }
      accept_invite: {
        Args: { invite_token: string }
        Returns: string
      }
      sync_member_profile: {
        Args: { p_display_name: string | null; p_email: string | null; p_avatar_url: string | null }
        Returns: void
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
