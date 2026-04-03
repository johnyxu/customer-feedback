import { I18N_KEYS } from '../i18n/keys'
import { messages, type Locale } from '../i18n/messages'

export function formatUpdatedAt(iso: string, locale: Locale): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return messages[locale][I18N_KEYS.DATE_JUST_NOW]
  if (minutes < 60) return `${minutes} ${messages[locale][I18N_KEYS.DATE_MINUTES_AGO]}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${messages[locale][I18N_KEYS.DATE_HOURS_AGO]}`
  const days = Math.floor(hours / 24)
  if (days === 1) return messages[locale][I18N_KEYS.DATE_YESTERDAY]
  if (days < 30) return `${days} ${messages[locale][I18N_KEYS.DATE_DAYS_AGO]}`
  return new Date(iso).toLocaleDateString(locale, { month: 'long', day: 'numeric' })
}

export function formatTime(input: string, _locale: Locale): string {
  void _locale
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
