import { Button } from './Button'
import { Modal } from './Modal'
import { Spinner } from './Spinner'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  busy?: boolean
}

/**
 * Destructive-action confirmation modal (e.g. deleting a card). Same
 * shape as the SOS confirmation: a danger-styled confirm button plus a
 * ghost cancel button.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  busy,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="danger" size="lg" fullWidth onClick={onConfirm} disabled={busy}>
            {busy ? <Spinner size={22} className="border-sos-on/40 border-t-sos-on" /> : confirmLabel}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
        </>
      }
    >
      {description}
    </Modal>
  )
}
