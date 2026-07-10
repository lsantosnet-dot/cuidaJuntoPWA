import type { MembershipRow, InviteRow, MembershipRole } from '@/lib/database.types'

export type { MembershipRow, InviteRow, MembershipRole }

export const ROLE_OPTIONS: MembershipRole[] = ['admin', 'family', 'caregiver']

export interface NewInvite {
  email: string
  role: MembershipRole
}
