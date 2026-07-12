import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui'

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000 // 1h

/**
 * Notifies the user when a new app version has finished downloading in the
 * background and is ready to install. Update only happens on confirmation
 * (registerType: 'prompt' in vite.config.ts), so a caregiver never loses
 * in-progress input to a silent reload.
 */
export function UpdateNotice() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      // Check right away too: registration.update() bypasses the browser's
      // own ~24h throttle on background checks, so a plain refresh actually
      // picks up a version that was just deployed instead of waiting on it.
      void registration.update()
      setInterval(() => {
        void registration.update()
      }, UPDATE_CHECK_INTERVAL)
    },
  })

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      className="safe-top fixed inset-x-0 top-0 z-[100] flex items-center gap-3 bg-primary-container px-5 py-2 text-sm text-primary-on-container shadow-modal"
    >
      <Icon name="download" size={18} className="shrink-0" />
      <p className="flex-1">{t('pwa.updateAvailable')}</p>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="min-h-touch shrink-0 rounded-pill bg-primary px-4 text-sm font-semibold text-primary-on active:scale-[0.98]"
      >
        {t('pwa.update')}
      </button>
    </div>
  )
}
