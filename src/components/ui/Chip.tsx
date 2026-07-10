import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'sage' | 'sand' | 'teal' | 'danger' | 'neutral'

const TONES: Record<Tone, string> = {
  sage: 'bg-secondary-container text-secondary-on-container',
  sand: 'bg-tertiary-container text-tertiary-on-container',
  teal: 'bg-primary-container text-primary-on',
  danger: 'bg-danger-container text-danger-on-container',
  neutral: 'bg-surface-container-high text-content-variant',
}

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

/** Small pill label for tags (family roles, health categories, statuses). */
export function Chip({ tone = 'sage', className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-3 py-1 text-sm font-semibold',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
