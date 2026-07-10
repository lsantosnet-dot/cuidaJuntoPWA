import { cn } from '@/lib/cn'

interface AvatarProps {
  name: string
  src?: string | null
  size?: number
  className?: string
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/** Circular avatar with a graceful initials fallback (no broken image icons). */
export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  const dimension = { width: size, height: size }
  return src ? (
    <img
      src={src}
      alt={name}
      style={dimension}
      className={cn('rounded-pill object-cover', className)}
    />
  ) : (
    <span
      style={dimension}
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center rounded-pill bg-primary-container',
        'font-semibold text-primary-on',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
