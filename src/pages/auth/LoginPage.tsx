import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { loginWithPassword, loginWithGoogle } from '@api/auth'
import { LocaleSwitcher } from '@components/ui/LocaleSwitcher'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedEmail = email.trim()
  const emailValid = emailRegex.test(trimmedEmail)
  const canSubmit = emailValid && password.length > 0 && !isLoading

  function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential
    if (!idToken) return
    setError(null)
    setIsLoading(true)
    loginWithGoogle(idToken)
      .then(() => navigate('/feedback/list'))
      .catch(err => {
        setError(err instanceof Error ? err.message : t(I18N_KEYS.AUTH_LOGIN_FAILED))
        setIsLoading(false)
      })
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setIsLoading(true)
    try {
      await loginWithPassword(trimmedEmail, password)
      navigate('/feedback/list')
    } catch (err) {
      setError(err instanceof Error ? err.message : t(I18N_KEYS.AUTH_LOGIN_FAILED))
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      {/* Hero */}
      <div className="relative bg-linear-to-br from-[#0ea5e9] via-[#2563eb] to-[#4f46e5] px-4 pb-8 pt-3 text-white">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.14em] text-white/80">Customer Feedback</p>
          <LocaleSwitcher variant="dark" />
        </div>
        <div className="mt-6">
          <h1 className="text-2xl font-black leading-tight">{t(I18N_KEYS.AUTH_LOGIN_TITLE)}</h1>
          <p className="mt-1.5 text-sm text-white/80">{t(I18N_KEYS.AUTH_LOGIN_SUBTITLE)}</p>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {/* Google button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t(I18N_KEYS.AUTH_LOGIN_FAILED))}
            width={361}
            text="signin_with"
            shape="rectangular"
            logo_alignment="center"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">{t(I18N_KEYS.AUTH_LOGIN_DIVIDER)}</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Email + password form */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" onKeyDown={handleKeyDown}>
          {/* Email */}
          <label htmlFor="login-email" className="block text-xs text-gray-500">
            {t(I18N_KEYS.AUTH_LOGIN_EMAIL_LABEL)}
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
            <span className={['text-sm', emailValid && trimmedEmail ? 'text-emerald-600' : 'text-gray-400'].join(' ')}>
              @
            </span>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => {
                setError(null)
                setEmail(e.target.value)
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-full flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Password */}
          <div className="mt-3 flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs text-gray-500">
              {t(I18N_KEYS.AUTH_LOGIN_PASSWORD_LABEL)}
            </label>
            <button
              type="button"
              onClick={() => navigate('/auth/forgot-password')}
              className="text-xs font-medium text-indigo-600"
            >
              {t(I18N_KEYS.AUTH_LOGIN_FORGOT)}
            </button>
          </div>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition-colors focus-within:border-indigo-300 focus-within:bg-indigo-50">
            <span className="text-sm text-gray-400">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setError(null)
                setPassword(e.target.value)
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-full flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="text-gray-400"
              aria-label="toggle password visibility"
            >
              {showPassword ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-4 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            {isLoading ? t(I18N_KEYS.AUTH_LOGIN_SUBMITTING) : t(I18N_KEYS.AUTH_LOGIN_SUBMIT)}
          </button>

          {error && (
            <p className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
          )}
        </section>

        {/* Register link */}
        <p className="text-center text-xs text-gray-500">
          {t(I18N_KEYS.AUTH_LOGIN_NO_ACCOUNT)}{' '}
          <button type="button" onClick={() => navigate('/auth/register')} className="font-semibold text-indigo-600">
            {t(I18N_KEYS.AUTH_LOGIN_REGISTER_LINK)}
          </button>
        </p>
      </div>
    </div>
  )
}
