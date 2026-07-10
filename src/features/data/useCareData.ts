import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useCareCircle } from '@/features/care-circle'
import { useAuth } from '@/features/auth'
import { DEMO_CIRCLE_ID, DEMO_USER_ID } from '@/features/demo/demoStore'
import type { AppSupabaseClient } from '@/lib/supabase'

export type DataMode = 'supabase' | 'demo'

export interface CareData {
  /** 'supabase' when signed in with a real circle; 'demo' otherwise. */
  mode: DataMode
  supabase: AppSupabaseClient | null
  circleId: string
  user: { id: string; name: string }
}

/**
 * Single decision point for every feature hook: are we reading/writing the real
 * Supabase-backed circle, or the in-memory demo? Keeps the branch out of each
 * module so their code reads the same in both modes.
 */
export function useCareData(): CareData {
  const supabase = useSupabaseClient()
  const { activeCircleId, isEnabled } = useCareCircle()
  const { user, isDemo } = useAuth()

  const useReal = !isDemo && isEnabled && supabase !== null && Boolean(activeCircleId)

  return {
    mode: useReal ? 'supabase' : 'demo',
    supabase,
    circleId: useReal ? (activeCircleId as string) : DEMO_CIRCLE_ID,
    user: { id: user?.id ?? DEMO_USER_ID, name: user?.name ?? 'Você' },
  }
}
