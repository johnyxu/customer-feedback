import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'

/**
 * Keeps `?lang=<locale>` in sync with the current URL whenever the route or
 * locale changes. Must be rendered inside both BrowserRouter and I18nProvider.
 */
export function RouterLocaleSync() {
  const { locale } = useI18n()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('lang', locale)
    const query = params.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState(null, '', nextUrl)
  }, [locale, location.pathname])

  return null
}
