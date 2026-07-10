import type { ReactNode } from 'react'
import { useId } from 'react'

interface FormFieldProps {
  label: string
  hint?: string
  /** Render prop receives the id to wire label ↔ control for accessibility. */
  children: (id: string) => ReactNode
}

/** Label + control + optional hint, with a persistent top-aligned label. */
export function FormField({ label, hint, children }: FormFieldProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-semibold text-content">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-sm text-content-variant">{hint}</p>}
    </div>
  )
}
