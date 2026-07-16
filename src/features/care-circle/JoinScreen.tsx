import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Spinner, Chip } from '@/components/ui'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useAuth } from '@/features/auth'
import { ROUTES } from '@/lib/routes'
import { useCareCircle } from './CareCircleContext'
import { getInvite, acceptInvite, type InvitePreview } from './joinApi'

type Status = 'loading' | 'ready' | 'accepting' | 'invalid' | 'demo'

/** Full-page invite acceptance, reached via a shared link `#/join/:token`. */
export function JoinScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token = '' } = useParams()
  const supabase = useSupabaseClient()
  const { isDemo } = useAuth()
  const { refresh, setActiveCircleId } = useCareCircle()

  const [status, setStatus] = useState<Status>('loading')
  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    // Accepting an invite requires a real signed-in session.
    if (isDemo || !supabase) {
      setStatus('demo')
      return
    }
    void (async () => {
      try {
        const p = await getInvite(supabase, token)
        if (!active) return
        if (!p || p.status !== 'pending') {
          setStatus('invalid')
          return
        }
        setPreview(p)
        setStatus('ready')
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Erro')
        setStatus('invalid')
      }
    })()
    return () => {
      active = false
    }
  }, [isDemo, supabase, token])

  const accept = useCallback(async () => {
    if (!supabase || !preview) return
    setStatus('accepting')
    try {
      const circleId = await acceptInvite(supabase, token)
      await refresh()
      setActiveCircleId(circleId)
      navigate(ROUTES.home, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
      setStatus('invalid')
    }
  }, [supabase, preview, token, refresh, setActiveCircleId, navigate])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col items-center justify-center gap-6 px-5 py-10 text-center">
      <h1 className="text-3xl font-bold text-primary">{t('join.title')}</h1>

      {status === 'loading' && <Spinner label={t('common.loading')} />}

      {status === 'demo' && (
        <p className="text-base text-content-variant">{t('join.demo')}</p>
      )}

      {status === 'invalid' && (
        <>
          <p className="text-base text-content-variant">{error ?? t('join.invalid')}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.home, { replace: true })}>
            {t('join.backHome')}
          </Button>
        </>
      )}

      {(status === 'ready' || status === 'accepting') && preview && (
        <>
          <p className="text-lg text-content">
            {t('join.invitedTo')}{' '}
            <span className="font-bold">{preview.circleName}</span>
          </p>
          <Chip tone="teal">{t(`team.role.${preview.role}`)}</Chip>
          <Button size="lg" fullWidth onClick={accept} loading={status === 'accepting'}>
            {t('join.accept')}
          </Button>
        </>
      )}
    </div>
  )
}
