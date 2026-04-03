export type Locale = 'zh-CN' | 'zh-Hant' | 'en'

import { enMessages } from './locales/en'
import type { I18nKey } from './keys'
import { zhCNMessages } from './locales/zh-CN'
import { zhHantMessages } from './locales/zh-Hant'

export const messages: Record<Locale, Record<I18nKey, string>> = {
  'zh-CN': zhCNMessages,
  'zh-Hant': zhHantMessages,
  en: enMessages,
}
