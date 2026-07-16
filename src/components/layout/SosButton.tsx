import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Icon, Modal } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useCareCircle } from '@/features/care-circle'
import { sendNotify } from '@/features/notifications'

/**
 * Persistent emergency action in the header. Opens a confirmation modal to
 * prevent accidental triggers, then pushes an alert to the whole care team
 * (via the `notify` Edge Function). No-op sender in demo mode.
 */
export function SosButton() {
  const { t } = useTranslation()
  const { isOpen, open, close } = useDisclosure()
  const supabase = useSupabaseClient()
  const { activeCircleId, activeCircle } = useCareCircle()
  const [sending, setSending] = useState(false)

  const handleConfirm = async () => {
    if (supabase && activeCircleId) {
      setSending(true)
      try {
        await sendNotify(supabase, {
          circleId: activeCircleId,
          title: t('sos.pushTitle'),
          body: t('sos.pushBody', { circle: activeCircle?.name ?? '' }),
          url: import.meta.env.BASE_URL,
          excludeSelf: true,
        })
      } catch {
        // Best-effort: never block closing the emergency dialog on a send error.
      } finally {
        setSending(false)
      }
    }
    close()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex min-h-touch items-center gap-1.5 rounded-pill bg-sos px-4 font-bold text-sos-on transition-transform active:scale-[0.96]"
      >
        <Icon name="alert" size={20} />
        {t('header.sos')}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={t('sos.title')}
        footer={
          <>
            <Button variant="danger" size="lg" fullWidth onClick={handleConfirm} loading={sending}>
              {t('sos.confirm')}
            </Button>
            <Button variant="ghost" fullWidth onClick={close} disabled={sending}>
              {t('sos.cancel')}
            </Button>
          </>
        }
      >
        {t('sos.description')}
      </Modal>
    </>
  )
}
