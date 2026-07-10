import { createContext, useContext } from 'react'

export interface AuthUser {
  /** Stable identity id. Clerk user id (e.g. "user_123") or "demo-user". */
  id: string
  name: string
  email: string | null
  imageUrl: string | null
}

export interface AuthState {
  /** Auth provider finished initializing (Clerk loaded, or demo ready). */
  isReady: boolean
  isSignedIn: boolean
  /** True when running without Clerk configured (public demo). */
  isDemo: boolean
  user: AuthUser | null
  /** Returns a JWT for Supabase, or null in demo mode. */
  getToken: () => Promise<string | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

/** Normalized auth state, independent of whether Clerk is configured. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
