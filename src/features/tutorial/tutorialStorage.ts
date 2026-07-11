const TUTORIAL_SEEN_KEY = 'cuidajunto.tutorialSeen'

export function hasSeenTutorial(): boolean {
  return localStorage.getItem(TUTORIAL_SEEN_KEY) === '1'
}

export function markTutorialSeen() {
  localStorage.setItem(TUTORIAL_SEEN_KEY, '1')
}
