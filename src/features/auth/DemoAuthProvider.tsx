import { useMemo, type ReactNode } from 'react'
import { AuthContext, type AuthState, type AuthUser } from './AuthContext'

const DEMO_USER: AuthUser = {
  id: 'demo-user',
  name: 'Visitante',
  email: null,
  imageUrl: null,
}

/**
 * Fallback auth used when Clerk is not configured (public demo build).
 * Presents a signed-in "guest" so the shell is fully browsable, but never
 * issues a real token — Supabase calls stay disabled in this mode.
 */
export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthState>(
    () => ({
      isReady: true,
      isSignedIn: true,
      isDemo: true,
      user: DEMO_USER,
      getToken: async () => null,
      signOut: async () => {},
    }),
    [],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
