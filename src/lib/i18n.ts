import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ptCommon from '@/locales/pt/common.json'
import enCommon from '@/locales/en/common.json'

export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_STORAGE_KEY = 'cuidajunto.lang'

/**
 * Resources are grouped by feature namespace ("common" for now). New features
 * add their own JSON files and register their namespace here, keeping each
 * translation file small and focused.
 */
const resources = {
  pt: { common: ptCommon },
  en: { common: enCommon },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

export default i18n
