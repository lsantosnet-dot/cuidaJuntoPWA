import { useCallback, useEffect, useState } from 'react'

export type ThemePref = 'system' | 'light' | 'dark'

const THEME_KEY = 'cuidajunto.theme'
export const THEME_OPTIONS: ThemePref[] = ['system', 'light', 'dark']

// Matches the app's surface color in each theme (browser UI / status bar).
const THEME_COLORS = { light: '#00535b', dark: '#0f1414' } as const

function readPref(): ThemePref {
  const stored = localStorage.getItem(THEME_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function apply(pref: ThemePref) {
  const dark = pref === 'dark' || (pref === 'system' && systemPrefersDark())
  document.documentElement.classList.toggle('dark', dark)
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light))
}

/**
 * User-selectable theme: light / dark / follow the system. Persisted in
 * localStorage and applied as a `.dark` class on <html> (see index.html for the
 * pre-paint script that prevents a flash on load).
 */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref)

  const setTheme = useCallback((next: ThemePref) => {
    localStorage.setItem(THEME_KEY, next)
    setPref(next)
    apply(next)
  }, [])

  // While following the system, react to OS-level changes live.
  useEffect(() => {
    apply(pref)
    if (pref !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])

  return { pref, setTheme, options: THEME_OPTIONS }
}
