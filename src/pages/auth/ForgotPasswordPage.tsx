import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestPasswordReset } from '@api/auth'
import { BackButton } from '@components/ui/BackButton'
import { LocaleSwitcher } from '@components/ui/LocaleSwitcher'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_SECONDS = 60

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const trimmedEmail = email.trim()
  const emailValid = emailRegex.test(trimmedEmail)
  const canSubmit = emailValid && !isLoading

  useEffect(() => {
    if (secondsLeft === 0) return
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setIsLoading(true)
    try {
      await requestPasswordReset(trimmedEmail)
      setSent(true)
      setSecondsLeft(RESEND_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(I18N_KEYS.AUTH_FORGOT_FAILED))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || isLoading) return
    setError(null)
    setIsLoading(true)
    try {
      await requestPasswordReset(trimmedEmail)
      setSecondsLeft(RESEND_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(I18N_KEYS.AUTH_FORGOT_FAILED))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      {/* Header */}
      <div className="bg-linear-to-br from-[#0ea5e9] via-[#2563eb] to-[#4f46e5] px-4 pb-8 pt-3 text-white">
        <div className="flex items-center justify-between">
          <BackButton variant="dark" />
          <LocaleSwitcher variant="dark" />
        </div>
        <div className="mt-5">
          <h1 className="text-2xl font-black leading-tight">{t(I18N_KEYS.AUTH_FORGOT_TITLE)}</h1>
          <p className="mt-1.5 text-sm text-white/80">{t(I18N_KEYS.AUTH_FORGOT_SUBTITLE)}</p>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {!sent ? (
          /* Send form */
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <label htmlFor="forgot-email" className="block text-xs text-gray-500">
              {t(I18N_KEYS.AUTH_FORGOT_EMAIL_LABEL)}
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
              <span
                className={['text-sm', emailValid && trimmedEmail ? 'text-emerald-600' : 'text-gray-400'].join(' ')}
              >
                @
              </span>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={e => {
                  setError(null)
                  setEmail(e.target.value)
                }}
                placeholder="you@example.com"
                autoComplete="email"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSubmit()
                }}
                className="h-full flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="mt-4 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {isLoading ? t(I18N_KEYS.AUTH_FORGOT_SUBMITTING) : t(I18N_KEYS.AUTH_FORGOT_SUBMIT)}
            </button>

            {error && (
              <p className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {error}
              </p>
            )}
          </section>
        ) : (
          /* Success state */
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-emerald-900">{t(I18N_KEYS.AUTH_FORGOT_SENT_TITLE)}</h2>
                <p className="mt-1 text-xs leading-relaxed text-emerald-700">{t(I18N_KEYS.AUTH_FORGOT_SENT_DESC)}</p>
                <p className="mt-2 text-xs font-semibold text-emerald-800">{trimmedEmail}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-emerald-700">
                {secondsLeft > 0 && `${secondsLeft}${t(I18N_KEYS.AUTH_FORGOT_RESEND_AFTER)}`}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={secondsLeft > 0 || isLoading}
                className="text-xs font-semibold text-emerald-700 disabled:text-emerald-400 disabled:cursor-not-allowed"
              >
                {isLoading ? t(I18N_KEYS.AUTH_FORGOT_SUBMITTING) : t(I18N_KEYS.AUTH_FORGOT_RESEND)}
              </button>
            </div>

            {error && (
              <p className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {error}
              </p>
            )}
          </section>
        )}

        {/* Back to login */}
        <p className="text-center text-xs text-gray-500">
          <button type="button" onClick={() => navigate('/auth/login')} className="font-semibold text-indigo-600">
            {t(I18N_KEYS.AUTH_FORGOT_BACK_LOGIN)}
          </button>
        </p>
      </div>
    </div>
  )
}
