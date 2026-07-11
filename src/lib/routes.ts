/**
 * Central route path registry. Import from here instead of hardcoding strings
 * so paths stay consistent across the router, navigation and links.
 */
export const ROUTES = {
  home: '/',
  schedule: '/schedule',
  medications: '/medications',
  routine: '/routine',
  diary: '/diary',
  circles: '/circles',
  team: '/team',
  costs: '/costs',
  history: '/history',
  profile: '/profile',
  settings: '/settings',
  join: '/join',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

/** Builds the shareable invite-acceptance path for a token. */
export const joinPath = (token: string) => `${ROUTES.join}/${token}`
