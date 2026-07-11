/**
 * Flat cartoon-style illustrations for the onboarding tutorial. Kept as
 * self-contained SVGs (fixed pastel palette) so they read consistently in
 * both light and dark theme, matching the "Calm Guardian" accent colors.
 */
const TEAL = '#00535B'
const GREEN = '#4A654F'
const GREEN_LIGHT = '#8FCB9B'
const CORAL = '#FF8A5B'
const RED = '#C82222'
const SKIN = '#FFCBA4'
const HAIR = '#3E2723'

interface IllustrationProps {
  className?: string
}

export function WelcomeIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <circle cx="120" cy="120" r="116" fill="#FFE8DD" />
      <path d="M70 190c0-28 16-46 34-46s34 18 34 46z" fill={TEAL} />
      <circle cx="104" cy="112" r="26" fill={SKIN} />
      <path d="M84 100a20 16 0 0140-4" fill="none" stroke={HAIR} strokeWidth="6" strokeLinecap="round" />
      <path d="M132 190c0-26 15-42 32-42s32 16 32 42z" fill={GREEN} />
      <circle cx="164" cy="114" r="24" fill={SKIN} />
      <path d="M148 104c6-10 24-10 30 0" fill="none" stroke={HAIR} strokeWidth="6" strokeLinecap="round" />
      <path
        d="M120 78c-6-10-22-8-22 4 0 10 22 24 22 24s22-14 22-24c0-12-16-14-22-4z"
        fill={RED}
      />
    </svg>
  )
}

export function MedicationsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <circle cx="120" cy="120" r="116" fill="#DCF2E3" />
      <rect x="86" y="86" width="68" height="92" rx="16" fill="#FFFFFF" stroke={TEAL} strokeWidth="6" />
      <rect x="86" y="86" width="68" height="26" rx="13" fill={TEAL} />
      <circle cx="120" cy="99" r="4" fill="#FFFFFF" />
      <path d="M104 140h32M120 124v32" stroke={GREEN} strokeWidth="8" strokeLinecap="round" />
      <g transform="rotate(30 168 150)">
        <rect x="150" y="138" width="44" height="24" rx="12" fill={CORAL} />
        <rect x="150" y="138" width="22" height="24" rx="12" fill="#FFFFFF" />
      </g>
      <circle cx="176" cy="82" r="20" fill="#FFFFFF" stroke={GREEN} strokeWidth="5" />
      <path
        d="M176 72v10l7 7"
        stroke={GREEN}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function ScheduleIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <circle cx="120" cy="120" r="116" fill="#FFF3D6" />
      <rect x="60" y="70" width="120" height="104" rx="14" fill="#FFFFFF" stroke={TEAL} strokeWidth="6" />
      <rect x="60" y="70" width="120" height="30" rx="14" fill={TEAL} />
      <rect x="82" y="58" width="10" height="24" rx="5" fill={TEAL} />
      <rect x="148" y="58" width="10" height="24" rx="5" fill={TEAL} />
      <g fill={GREEN_LIGHT}>
        <rect x="76" y="112" width="18" height="18" rx="4" />
        <rect x="102" y="112" width="18" height="18" rx="4" />
        <rect x="128" y="112" width="18" height="18" rx="4" />
        <rect x="76" y="138" width="18" height="18" rx="4" />
        <rect x="102" y="138" width="18" height="18" rx="4" />
      </g>
      <circle cx="150" cy="147" r="24" fill={CORAL} />
      <path
        d="M140 147l7 7 13-14"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function DiaryIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <circle cx="120" cy="120" r="116" fill="#E4F3F5" />
      <g transform="rotate(-6 120 120)">
        <rect x="64" y="70" width="112" height="100" rx="10" fill="#FFFFFF" stroke={TEAL} strokeWidth="6" />
        <line x1="120" y1="70" x2="120" y2="170" stroke={TEAL} strokeWidth="4" />
        <path
          d="M104 96c-6-8-20-6-20 4 0 8 18 18 18 18s18-10 18-18c0-10-10-12-16-4z"
          fill={CORAL}
        />
        <line x1="136" y1="98" x2="164" y2="98" stroke={GREEN_LIGHT} strokeWidth="6" strokeLinecap="round" />
        <line x1="136" y1="112" x2="160" y2="112" stroke={GREEN_LIGHT} strokeWidth="6" strokeLinecap="round" />
        <line x1="80" y1="132" x2="104" y2="132" stroke={GREEN_LIGHT} strokeWidth="6" strokeLinecap="round" />
        <line x1="80" y1="146" x2="100" y2="146" stroke={GREEN_LIGHT} strokeWidth="6" strokeLinecap="round" />
      </g>
      <g transform="rotate(20 176 168)">
        <rect x="168" y="150" width="10" height="46" rx="5" fill={TEAL} />
        <path d="M168 150h10l-5-14z" fill={CORAL} />
      </g>
    </svg>
  )
}

export function TeamIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <circle cx="120" cy="120" r="116" fill="#DCF2E3" />
      <path d="M60 186c0-26 14-42 30-42s30 16 30 42z" fill={GREEN} />
      <circle cx="90" cy="120" r="22" fill={SKIN} />
      <path d="M150 190c0-28 16-46 34-46s34 18 34 46z" fill={TEAL} />
      <circle cx="184" cy="122" r="24" fill={SKIN} />
      <path d="M96 200c0-30 18-50 38-50s38 20 38 50z" fill={CORAL} />
      <circle cx="134" cy="126" r="26" fill={SKIN} />
      <path d="M112 116c8-12 30-12 38 0" fill="none" stroke={HAIR} strokeWidth="6" strokeLinecap="round" />
      <path
        d="M120 82c-6-10-22-8-22 4 0 10 22 24 22 24s22-14 22-24c0-12-16-14-22-4z"
        fill={RED}
      />
    </svg>
  )
}

export function NotificationsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <circle cx="120" cy="120" r="116" fill="#FFE3D1" />
      <rect x="80" y="52" width="80" height="136" rx="18" fill="#FFFFFF" stroke={TEAL} strokeWidth="6" />
      <rect x="88" y="66" width="64" height="98" rx="8" fill={TEAL} opacity="0.08" />
      <path
        d="M120 84a20 20 0 00-20 20v14l-8 12h56l-8-12v-14a20 20 0 00-20-20z"
        fill={TEAL}
      />
      <path d="M112 132a8 8 0 0016 0z" fill={TEAL} />
      <path
        d="M96 96a26 26 0 0148 0"
        fill="none"
        stroke={CORAL}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="150" cy="78" r="12" fill={RED} stroke="#FFFFFF" strokeWidth="3" />
    </svg>
  )
}
