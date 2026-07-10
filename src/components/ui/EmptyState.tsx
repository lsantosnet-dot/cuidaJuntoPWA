import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface EmptyStateProps {
  icon: IconName
  title: string
  description?: string
  action?: ReactNode
}

/** Friendly placeholder shown when a list is empty or a module is pending. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-surface-low px-6 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-primary/10 text-primary">
        <Icon name={icon} size={30} />
      </span>
      <h3 className="text-lg font-bold text-content">{title}</h3>
      {description && <p className="max-w-xs text-content-variant">{description}</p>}
      {action}
    </div>
  )
}
