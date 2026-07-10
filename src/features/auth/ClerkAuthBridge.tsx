import { useMemo, type ReactNode } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'
import { AuthContext, type AuthState } from './AuthContext'

/**
 * Adapts Clerk's hooks into our normalized {@link AuthState}. Must render inside
 * a <ClerkProvider>. Consumers use `useAuth()` and never touch Clerk directly,
 * which keeps the rest of the app decoupled from the auth vendor.
 */
export function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth()
  const { user } = useUser()

  const value = useMemo<AuthState>(
    () => ({
      isReady: isLoaded,
      isSignedIn: Boolean(isSignedIn),
      isDemo: false,
      user: user
        ? {
            id: user.id,
            name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? 'Usuário',
            email: user.primaryEmailAddress?.emailAddress ?? null,
            imageUrl: user.imageUrl ?? null,
          }
        : null,
      // Default Clerk session token — verified by Supabase via the Clerk
      // third-party auth integration (see supabase/README.md).
      getToken: () => getToken(),
      signOut: () => signOut(),
    }),
    [isLoaded, isSignedIn, user, getToken, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
