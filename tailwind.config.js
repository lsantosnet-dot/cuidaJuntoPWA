/**
 * Design tokens from the "Calm Guardian" system (see prototype DESIGN.md).
 * Colors are driven by CSS variables (channels) defined in src/styles/index.css,
 * so light/dark theming can be added later without touching component classes.
 */
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          container: withOpacity('--color-primary-container'),
          on: withOpacity('--color-on-primary'),
          'on-container': withOpacity('--color-on-primary-container'),
        },
        secondary: {
          DEFAULT: withOpacity('--color-secondary'),
          container: withOpacity('--color-secondary-container'),
          on: withOpacity('--color-on-secondary'),
          'on-container': withOpacity('--color-on-secondary-container'),
        },
        tertiary: {
          DEFAULT: withOpacity('--color-tertiary'),
          container: withOpacity('--color-tertiary-container'),
          on: withOpacity('--color-on-tertiary'),
          'on-container': withOpacity('--color-on-tertiary-container'),
        },
        danger: {
          DEFAULT: withOpacity('--color-error'),
          container: withOpacity('--color-error-container'),
          on: withOpacity('--color-on-error'),
          'on-container': withOpacity('--color-on-error-container'),
        },
        surface: {
          DEFAULT: withOpacity('--color-surface'),
          lowest: withOpacity('--color-surface-container-lowest'),
          low: withOpacity('--color-surface-container-low'),
          container: withOpacity('--color-surface-container'),
          high: withOpacity('--color-surface-container-high'),
          highest: withOpacity('--color-surface-container-highest'),
        },
        content: {
          DEFAULT: withOpacity('--color-on-surface'),
          variant: withOpacity('--color-on-surface-variant'),
        },
        outline: {
          DEFAULT: withOpacity('--color-outline'),
          variant: withOpacity('--color-outline-variant'),
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
        input: '0.75rem',
        pill: '9999px',
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
      boxShadow: {
        card: '0 4px 16px 0 rgb(0 0 0 / 0.12)',
        modal: '0 8px 24px 0 rgb(0 0 0 / 0.20)',
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
}
