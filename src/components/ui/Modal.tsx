import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Optional footer area for action buttons. */
  footer?: ReactNode
}

/**
 * Centered modal dialog (Level 2) with backdrop blur. Closes on Escape and
 * backdrop click. Reused for confirmations like SOS and, later, forms.
 */
export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[calc(100vh-2.5rem)] w-full max-w-app flex-col',
          'overflow-y-auto rounded-card bg-surface-lowest p-6 shadow-modal',
        )}
      >
        <h2 className="text-xl font-bold text-content">{title}</h2>
        <div className="mt-3 text-content-variant">{children}</div>
        {footer && <div className="mt-6 flex flex-col gap-3">{footer}</div>}
      </div>
    </div>
  )
}
