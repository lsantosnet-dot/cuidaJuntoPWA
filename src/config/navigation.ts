import { ROUTES } from '@/lib/routes'
import type { IconName } from '@/components/ui/Icon'

export interface NavItem {
  /** Route to navigate to. */
  path: string
  /** i18n key under the `nav` group. */
  labelKey: string
  /** Icon rendered in the nav. */
  icon: IconName
}

/**
 * Primary destinations shown in the bottom navigation bar.
 * Kept to 4 for a calm, uncluttered mobile experience.
 */
export const PRIMARY_NAV: NavItem[] = [
  { path: ROUTES.home, labelKey: 'nav.home', icon: 'home' },
  { path: ROUTES.schedule, labelKey: 'nav.schedule', icon: 'calendar' },
  { path: ROUTES.medications, labelKey: 'nav.medications', icon: 'pill' },
  { path: ROUTES.diary, labelKey: 'nav.diary', icon: 'book' },
]

/** Secondary destinations shown in the side drawer, grouped by section. */
export const CARE_NAV: NavItem[] = [
  { path: ROUTES.team, labelKey: 'nav.team', icon: 'users' },
  { path: ROUTES.costs, labelKey: 'nav.costs', icon: 'wallet' },
  { path: ROUTES.history, labelKey: 'nav.history', icon: 'history' },
  { path: ROUTES.profile, labelKey: 'nav.profile', icon: 'user' },
]

export const ACCOUNT_NAV: NavItem[] = [
  { path: ROUTES.settings, labelKey: 'nav.settings', icon: 'settings' },
]
