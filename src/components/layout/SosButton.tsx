import { useTranslation } from 'react-i18next'
import { Button, Icon, Modal } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'

/**
 * Persistent emergency action in the header. Opens a confirmation modal to
 * prevent accidental triggers. The actual team alert is wired in Phase 4.
 */
export function SosButton() {
  const { t } = useTranslation()
  const { isOpen, open, close } = useDisclosure()

  const handleConfirm = () => {
    // TODO(Phase 4): trigger Web Push emergency alert to the whole care team.
    close()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex min-h-touch items-center gap-1.5 rounded-pill bg-danger px-4 font-bold text-danger-on transition-transform active:scale-[0.96]"
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
            <Button variant="danger" size="lg" fullWidth onClick={handleConfirm}>
              {t('sos.confirm')}
            </Button>
            <Button variant="ghost" fullWidth onClick={close}>
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
