/**
 * Central route path registry. Import from here instead of hardcoding strings
 * so paths stay consistent across the router, navigation and links.
 */
export const ROUTES = {
  home: '/',
  schedule: '/schedule',
  medications: '/medications',
  diary: '/diary',
  team: '/team',
  history: '/history',
  profile: '/profile',
  settings: '/settings',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]
