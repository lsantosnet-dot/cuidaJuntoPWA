import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from './Icon'
import { Spinner } from './Spinner'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required since the button is icon-only. */
  label: string
  icon: IconName
  iconSize?: number
  /** Shows a spinner in place of the icon and disables the button, so a slow DB write can't be double-fired. */
  loading?: boolean
}

export function IconButton({
  label,
  icon,
  iconSize = 24,
  loading = false,
  className,
  type = 'button',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-touch min-w-touch items-center justify-center rounded-pill',
        'text-content transition-colors hover:bg-surface-container active:scale-[0.96]',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={iconSize} className="border-content/30 border-t-content" />
      ) : (
        <Icon name={icon} size={iconSize} />
      )}
    </button>
  )
}
