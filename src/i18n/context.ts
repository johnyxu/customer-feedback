import { createContext } from 'react'
import type { I18nKey } from './keys'
import type { Locale } from './messages'

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: I18nKey) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
