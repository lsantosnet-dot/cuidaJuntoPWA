import type { SVGProps } from 'react'

/**
 * Lightweight inline icon set (stroke-based, rounded terminals to match the
 * "Friendly-Geometric" shape language). Add new glyphs to ICON_PATHS.
 */
const ICON_PATHS = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />,
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  pill: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" />
      <path d="M9 9l6 6" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M17.5 20a5.5 5.5 0 0 0-3-4.9" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 1 2.6 6.1M3.5 12H8M3.5 12V7.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  alert: (
    <>
      <path d="M12 3 2.5 20h19z" />
      <path d="M12 9.5v5M12 17.5h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-6-3.8-9s1.3-6.5 3.8-9z" />
    </>
  ),
  chevronRight: <path d="M9 5l7 7-7 7" />,
  check: <path d="M4 12.5 9 17.5 20 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M10 12h9M16 8.5 19.5 12 16 15.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <path d="M6.5 7 7.3 19.5A1.5 1.5 0 0 0 8.8 21h6.4a1.5 1.5 0 0 0 1.5-1.5L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2 2 0 0 1 6 5.5h10.5a1.5 1.5 0 0 1 1.5 1.5v2" />
      <rect x="3" y="9" width="18" height="10.5" rx="2.5" />
      <circle cx="16.5" cy="14.2" r="1.1" />
    </>
  ),
} as const

export type IconName = keyof typeof ICON_PATHS

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  /** Pixel size (width & height). Defaults to 24. */
  size?: number
}

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {ICON_PATHS[name]}
    </svg>
  )
}
