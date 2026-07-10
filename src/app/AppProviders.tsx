import type { ReactNode } from 'react'
import { AuthProvider, RequireAuth } from '@/features/auth'
import { CareCircleProvider } from '@/features/care-circle'

/**
 * Composition root for cross-cutting providers, in dependency order:
 * auth → auth gate → active care circle. Kept separate from the router so the
 * wiring stays readable and each concern lives in its own feature module.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RequireAuth>
        <CareCircleProvider>{children}</CareCircleProvider>
      </RequireAuth>
    </AuthProvider>
  )
}
