import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/lib/i18n'

/** Reads and switches the active app language, persisted via i18n detector. */
export function useLanguage() {
  const { i18n } = useTranslation()

  const current = (SUPPORTED_LANGUAGES as readonly string[]).includes(i18n.language)
    ? (i18n.language as AppLanguage)
    : 'pt'

  const setLanguage = (lang: AppLanguage) => {
    void i18n.changeLanguage(lang)
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }

  return { current, setLanguage, languages: SUPPORTED_LANGUAGES }
}
