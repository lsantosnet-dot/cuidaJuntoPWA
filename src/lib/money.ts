import type { AppLanguage } from '@/lib/i18n'

const CURRENCY_LOCALES: Record<AppLanguage, string> = {
  pt: 'pt-BR',
  en: 'en-US',
}

/** Formats integer cents as a localized currency string, e.g. "R$ 45,00". */
export function formatCurrency(cents: number, lang: AppLanguage, currency = 'BRL'): string {
  return (cents / 100).toLocaleString(CURRENCY_LOCALES[lang] ?? 'pt-BR', {
    style: 'currency',
    currency,
  })
}

/** Converts a decimal amount (e.g. "45.90" from a number input) to integer cents. */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}
