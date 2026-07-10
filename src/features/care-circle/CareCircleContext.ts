import { createContext, useContext } from 'react'
import type { CareCircleState } from './types'

export const CareCircleContext = createContext<CareCircleState | null>(null)

/** Access the active care circle, its memberships and the current user's role. */
export function useCareCircle(): CareCircleState {
  const ctx = useContext(CareCircleContext)
  if (!ctx) throw new Error('useCareCircle must be used within <CareCircleProvider>')
  return ctx
}
