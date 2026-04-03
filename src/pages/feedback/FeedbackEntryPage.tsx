import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendEmailVerificationCode } from '@api/feedbackService'
import { LocaleSwitcher } from '@components/ui/LocaleSwitcher'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function FeedbackEntryPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedEmail = email.trim()
  const emailValid = useMemo(() => emailRegex.test(trimmedEmail), [trimmedEmail])

  async function handleContinueWithEmail() {
    if (!emailValid || isLoading) return

    setError(null)
    setIsLoading(true)

    try {
      await sendEmailVerificationCode(trimmedEmail)
      navigate('/feedback/verify', { state: { email: trimmedEmail } })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(I18N_KEYS.ENTRY_SEND_CODE_FAILED)
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  function handleContinueAnonymous() {
    setAnonymous(true)
    navigate('/feedback')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <div className="bg-linear-to-br from-[#0ea5e9] via-[#2563eb] to-[#4f46e5] px-4 pb-6 pt-3 text-white">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.14em] text-white/80">Customer Feedback</p>
          <LocaleSwitcher variant="dark" />
        </div>
        <h1 className="mt-2 text-2xl font-black leading-tight">{t(I18N_KEYS.ENTRY_HERO_TITLE)}</h1>
        <p className="mt-2 text-sm text-white/90">{t(I18N_KEYS.ENTRY_HERO_DESC)}</p>
      </div>

      <div className="space-y-3 px-4 py-4">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">{t(I18N_KEYS.ENTRY_SECTION_TITLE)}</h2>
          <p className="mt-1 text-xs text-gray-500">{t(I18N_KEYS.ENTRY_SECTION_DESC)}</p>

          <label htmlFor="email" className="mt-4 block text-xs text-gray-500">
            {t(I18N_KEYS.ENTRY_EMAIL_LABEL)}
          </label>
          <div
            className={[
              'mt-1 flex h-11 items-center gap-2 rounded-xl border px-3 transition-colors',
              trimmedEmail.length === 0
                ? 'border-gray-200 bg-gray-50'
                : emailValid
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-rose-300 bg-rose-50',
            ].join(' ')}
          >
            <span className={emailValid ? 'text-emerald-600' : 'text-gray-400'}>@</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={event => {
                setAnonymous(false)
                setEmail(event.target.value)
              }}
              placeholder="you@example.com"
              className="h-full flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          <p
            className={[
              'mt-1 text-xs',
              trimmedEmail.length === 0 ? 'text-gray-400' : emailValid ? 'text-emerald-600' : 'text-rose-600',
            ].join(' ')}
          >
            {trimmedEmail.length === 0
              ? t(I18N_KEYS.ENTRY_EMAIL_HINT_EMPTY)
              : emailValid
                ? t(I18N_KEYS.ENTRY_EMAIL_HINT_VALID)
                : t(I18N_KEYS.ENTRY_EMAIL_HINT_INVALID)}
          </p>

          <button
            type="button"
            onClick={handleContinueWithEmail}
            disabled={!emailValid || isLoading}
            className="mt-4 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            {isLoading ? t(I18N_KEYS.ENTRY_SENDING) : t(I18N_KEYS.ENTRY_NEXT_VERIFY)}
          </button>

          {error && (
            <p className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
          )}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-900">{t(I18N_KEYS.ENTRY_ANON_TITLE)}</h3>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">{t(I18N_KEYS.ENTRY_ANON_DESC)}</p>
          <button
            type="button"
            onClick={handleContinueAnonymous}
            className="mt-3 h-9 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white"
          >
            {t(I18N_KEYS.ENTRY_ANON_CONTINUE)}
          </button>
          {anonymous && (
            <p className="mt-2 rounded-lg border border-amber-300 bg-white/70 px-3 py-2 text-xs text-amber-900">
              {t(I18N_KEYS.ENTRY_ANON_SELECTED)}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
