import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './context'
import { messages, type Locale } from './messages'

const STORAGE_KEY = 'xiaozhu.web.locale'
const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'zh-Hant', 'en']
const URL_LOCALE_KEY = 'lang'

function resolveLocale(raw: string | null): Locale | null {
  if (!raw) return null

  const value = raw.trim().toLowerCase()
  if (value === 'en' || value === 'en-us' || value === 'en-gb') return 'en'
  if (value === 'zh-cn' || value === 'zh-hans' || value === 'zh') return 'zh-CN'
  if (value === 'zh-hant' || value === 'zh-tw' || value === 'zh-hk' || value === 'zh-mo') return 'zh-Hant'
  return null
}

function readLocaleFromUrl(): Locale | null {
  const params = new URLSearchParams(window.location.search)
  const byLang = resolveLocale(params.get(URL_LOCALE_KEY))
  if (byLang) return byLang
  return resolveLocale(params.get('locale'))
}

function writeLocaleToUrl(locale: Locale) {
  const params = new URLSearchParams(window.location.search)
  params.set(URL_LOCALE_KEY, locale)
  params.delete('locale')
  const query = params.toString()
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', nextUrl)
}

function detectInitialLocale(): Locale {
  const fromUrl = readLocaleFromUrl()
  if (fromUrl) {
    return fromUrl
  }

  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
    return saved
  }

  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('zh-tw') || lang.startsWith('zh-hk') || lang.startsWith('zh-mo') || lang.includes('hant')) {
    return 'zh-Hant'
  }
  if (lang.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en'
}

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale)

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
    if (readLocaleFromUrl() !== locale) {
      writeLocaleToUrl(locale)
    }
  }, [locale])

  const value = useMemo<I18nContextValue>(() => {
    const table = messages[locale]
    return {
      locale,
      setLocale,
      t: (key: string) => table[key] ?? messages['zh-CN'][key] ?? key,
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
