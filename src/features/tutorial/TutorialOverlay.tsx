import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { usePushNotifications } from '@/features/notifications'
import {
  WelcomeIllustration,
  MedicationsIllustration,
  ScheduleIllustration,
  DiaryIllustration,
  TeamIllustration,
  NotificationsIllustration,
} from './illustrations'

const SLIDES = [
  { key: 'welcome', Illustration: WelcomeIllustration },
  { key: 'medications', Illustration: MedicationsIllustration },
  { key: 'schedule', Illustration: ScheduleIllustration },
  { key: 'diary', Illustration: DiaryIllustration },
  { key: 'team', Illustration: TeamIllustration },
  { key: 'notifications', Illustration: NotificationsIllustration },
] as const

interface TutorialOverlayProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Full-screen slide-through tutorial explaining the app's main features,
 * ending on an optional "enable notifications" call to action that reuses
 * the real push-subscription flow.
 */
export function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const { configured, subscribed, subscribe, busy } = usePushNotifications()

  if (!isOpen) return null

  const slide = SLIDES[step]
  const isFirst = step === 0
  const isLast = step === SLIDES.length - 1
  const showEnableNotifications = isLast && configured && !subscribed

  const handleNext = () => {
    if (isLast) {
      onClose()
      return
    }
    setStep((s) => s + 1)
  }

  const handleEnableNotifications = async () => {
    await subscribe()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('tutorial.title')}
      className="safe-top fixed inset-0 z-[70] flex flex-col bg-surface"
    >
      <div className="flex justify-end px-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="min-h-touch rounded-pill px-4 text-sm font-semibold text-content-variant hover:bg-surface-container"
        >
          {t('tutorial.actions.skip')}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-app flex-1 flex-col px-6">
        <div className="flex flex-1 items-center justify-center">
          <slide.Illustration className="h-56 w-56" />
        </div>

        <div className="pb-4 text-center">
          <h2 className="text-2xl font-bold text-content">
            {t(`tutorial.slides.${slide.key}.title`)}
          </h2>
          <p className="mt-3 text-base text-content-variant">
            {t(`tutorial.slides.${slide.key}.description`)}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pb-6" aria-hidden="true">
          {SLIDES.map((s, i) => (
            <span
              key={s.key}
              className={cn(
                'h-2 rounded-pill transition-all',
                i === step ? 'w-6 bg-primary' : 'w-2 bg-outline-variant',
              )}
            />
          ))}
        </div>

        <div className="safe-bottom flex flex-col gap-3 pb-6">
          {showEnableNotifications ? (
            <Button fullWidth size="lg" onClick={handleEnableNotifications} disabled={busy}>
              {t('tutorial.actions.enableNotifications')}
            </Button>
          ) : (
            <Button fullWidth size="lg" onClick={handleNext}>
              {isLast ? t('tutorial.actions.finish') : t('tutorial.actions.next')}
            </Button>
          )}
          {!isFirst && (
            <Button fullWidth size="lg" variant="ghost" onClick={() => setStep((s) => s - 1)}>
              {t('tutorial.actions.back')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
