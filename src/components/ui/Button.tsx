import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

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

/** Spinner ring color per variant, matched to that variant's text/foreground color. */
const SPINNER_VARIANTS: Record<Variant, string> = {
  primary: 'border-primary-on/30 border-t-primary-on',
  outline: 'border-primary/30 border-t-primary',
  danger: 'border-sos-on/30 border-t-sos-on',
  ghost: 'border-content/30 border-t-content',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  leadingIcon?: ReactNode
  /** Shows a spinner in place of the leading icon and disables the button, so a slow DB write can't be double-fired. */
  loading?: boolean
  /** Override the spinner ring color, for buttons whose className repaints the variant's default foreground. */
  spinnerClassName?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  loading = false,
  spinnerClassName,
  className,
  children,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
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
      {loading ? <Spinner size={20} className={spinnerClassName ?? SPINNER_VARIANTS[variant]} /> : leadingIcon}
      {children}
    </button>
  )
}
