import type {
  CareCircleRow,
  MembershipRow,
  MembershipRole,
} from '@/lib/database.types'

export type { CareCircleRow, MembershipRole }

/** A membership joined with its parent care circle. */
export interface MembershipWithCircle extends MembershipRow {
  care_circles: CareCircleRow
}

export interface CareCircleState {
  /** True when Supabase is configured and the user is really signed in. */
  isEnabled: boolean
  isLoading: boolean
  error: string | null
  memberships: MembershipWithCircle[]
  activeCircleId: string | null
  activeCircle: CareCircleRow | null
  activeRole: MembershipRole | null
  /** No circle yet — the app should route to circle onboarding (Phase 3). */
  needsOnboarding: boolean
  setActiveCircleId: (id: string) => void
  refresh: () => Promise<void>
  createCircle: (input: { name: string; recipientName?: string }) => Promise<string | null>
}
