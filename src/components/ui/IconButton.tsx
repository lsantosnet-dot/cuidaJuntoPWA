import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from './Icon'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required since the button is icon-only. */
  label: string
  icon: IconName
  iconSize?: number
}

export function IconButton({
  label,
  icon,
  iconSize = 24,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex min-h-touch min-w-touch items-center justify-center rounded-pill',
        'text-content transition-colors hover:bg-surface-container active:scale-[0.96]',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  )
}
