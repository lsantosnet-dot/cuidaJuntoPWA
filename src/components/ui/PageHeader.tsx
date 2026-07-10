interface PageHeaderProps {
  title: string
  subtitle?: string
}

/** Consistent page title block used at the top of each screen. */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-5">
      <h1 className="text-3xl font-bold leading-tight text-content">{title}</h1>
      {subtitle && <p className="mt-1 text-content-variant">{subtitle}</p>}
    </header>
  )
}
