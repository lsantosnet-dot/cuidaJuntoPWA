import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'outline' | 'danger' | 'ghost'
type Size = 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-primary-on hover:bg-primary-container active:scale-[0.98]',
  outline:
    'border-2 border-primary text-primary bg-transparent hover:bg-primary/5 active:scale-[0.98]',
  danger: 'bg-sos text-sos-on hover:brightness-110 active:scale-[0.98]',
  ghost: 'bg-transparent text-content hover:bg-surface-container active:scale-[0.98]',
}

const SIZES: Record<Size, string> = {
  md: 'min-h-touch px-5 text-base',
  lg: 'min-h-[56px] px-6 text-lg',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  leadingIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill font-semibold',
        'transition-transform duration-100 disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  )
}
