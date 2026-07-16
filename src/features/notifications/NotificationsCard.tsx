import { useTranslation } from 'react-i18next'
import { Button, Icon } from '@/components/ui'
import { usePushNotifications } from './usePushNotifications'

/** Settings section to enable/disable Web Push for this device. */
export function NotificationsCard() {
  const { t } = useTranslation()
  const push = usePushNotifications()

  if (!push.supported) {
    return <p className="text-base text-content-variant">{t('notifications.unsupported')}</p>
  }

  if (push.iosNeedsInstall) {
    return (
      <div className="flex items-start gap-3">
        <Icon name="info" size={20} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-base text-content-variant">{t('notifications.iosInstall')}</p>
      </div>
    )
  }

  if (!push.configured) {
    return <p className="text-base text-content-variant">{t('notifications.notConfigured')}</p>
  }

  if (push.permission === 'denied') {
    return <p className="text-base text-content-variant">{t('notifications.blocked')}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base text-content-variant">
        {push.subscribed ? t('notifications.onDescription') : t('notifications.offDescription')}
      </p>
      {push.error && <p className="text-base text-danger">{push.error}</p>}
      {push.subscribed ? (
        <Button variant="outline" onClick={() => void push.unsubscribe()} loading={push.busy}>
          {t('notifications.disable')}
        </Button>
      ) : (
        <Button
          onClick={() => void push.subscribe()}
          loading={push.busy}
          leadingIcon={<Icon name="info" size={20} />}
        >
          {t('notifications.enable')}
        </Button>
      )}
    </div>
  )
}
