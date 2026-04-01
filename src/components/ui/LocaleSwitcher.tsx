import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import type { Locale } from '../../i18n/messages'

const LOCALE_OPTIONS: Array<{ value: Locale; shortLabel: string; labelKey: string }> = [
  { value: 'zh-CN', shortLabel: '简', labelKey: 'locale.zh-CN' },
  { value: 'zh-Hant', shortLabel: '繁', labelKey: 'locale.zh-Hant' },
  { value: 'en', shortLabel: 'EN', labelKey: 'locale.en' },
]

interface LocaleSwitcherProps {
  /** 'dark' for use on coloured/gradient backgrounds; 'light' for white/grey page headers */
  variant?: 'dark' | 'light'
}

export function LocaleSwitcher({ variant = 'light' }: LocaleSwitcherProps) {
  const { locale, setLocale, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const current = LOCALE_OPTIONS.find(item => item.value === locale) ?? LOCALE_OPTIONS[0]

  const triggerCls =
    variant === 'dark'
      ? 'inline-flex items-center justify-center text-white text-sm opacity-90 cursor-pointer border-0 bg-transparent p-0 leading-none'
      : 'h-9 w-9 rounded-full bg-slate-100 text-slate-500 text-sm font-medium cursor-pointer border-0 flex items-center justify-center'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={t('nav.switchLanguage')}
        className={triggerCls}
      >
        {current.shortLabel}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label={t('nav.languagePickerCancel')}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 border-0 bg-black/20"
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 w-[200px] rounded-xl border border-gray-100 bg-white p-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <p className="m-0 mb-2 px-1 text-xs font-semibold text-gray-500">{t('nav.languagePickerTitle')}</p>

            <div className="grid gap-1.5">
              {LOCALE_OPTIONS.map(item => {
                const active = item.value === locale
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setLocale(item.value)
                      setIsOpen(false)
                    }}
                    className={[
                      'flex w-full cursor-pointer items-center justify-between rounded-lg border px-2.5 py-2 text-left text-sm transition-colors',
                      active
                        ? 'border-violet-300 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-violet-200 hover:bg-violet-50/40',
                    ].join(' ')}
                  >
                    <span>{t(item.labelKey)}</span>
                    <span className={active ? 'text-violet-600' : 'text-gray-300'}>{active ? '✓' : '○'}</span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              {t('nav.languagePickerCancel')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
