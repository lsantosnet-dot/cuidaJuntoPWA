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

/** Primary destinations shown in the bottom navigation bar. */
export const PRIMARY_NAV: NavItem[] = [
  { path: ROUTES.home, labelKey: 'nav.home', icon: 'home' },
  { path: ROUTES.medications, labelKey: 'nav.medications', icon: 'pill' },
  { path: ROUTES.routine, labelKey: 'nav.routine', icon: 'checklist' },
  { path: ROUTES.schedule, labelKey: 'nav.schedule', icon: 'calendar' },
  { path: ROUTES.costs, labelKey: 'nav.costs', icon: 'wallet' },
]

/** Secondary destinations shown in the side drawer, grouped by section. */
export const CARE_NAV: NavItem[] = [
  { path: ROUTES.circles, labelKey: 'nav.circles', icon: 'circles' },
  { path: ROUTES.team, labelKey: 'nav.team', icon: 'users' },
  { path: ROUTES.diary, labelKey: 'nav.diary', icon: 'book' },
  { path: ROUTES.history, labelKey: 'nav.history', icon: 'history' },
  { path: ROUTES.profile, labelKey: 'nav.profile', icon: 'user' },
]

export const ACCOUNT_NAV: NavItem[] = [
  { path: ROUTES.settings, labelKey: 'nav.settings', icon: 'settings' },
]
