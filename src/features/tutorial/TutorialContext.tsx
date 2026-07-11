import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { TutorialOverlay } from './TutorialOverlay'
import { hasSeenTutorial, markTutorialSeen } from './tutorialStorage'

interface TutorialContextValue {
  /** Opens the tutorial on demand (e.g. "View tutorial" in the side drawer). */
  openTutorial: () => void
}

const TutorialContext = createContext<TutorialContextValue | null>(null)

/**
 * Mounts the tutorial overlay and auto-opens it the first time the app shell
 * renders for a given device (tracked in localStorage), while also exposing
 * a manual trigger for revisiting it later.
 */
export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!hasSeenTutorial()) setIsOpen(true)
  }, [])

  const openTutorial = useCallback(() => setIsOpen(true), [])

  const close = useCallback(() => {
    markTutorialSeen()
    setIsOpen(false)
  }, [])

  return (
    <TutorialContext.Provider value={{ openTutorial }}>
      {children}
      <TutorialOverlay isOpen={isOpen} onClose={close} />
    </TutorialContext.Provider>
  )
}

export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext)
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider')
  return ctx
}
