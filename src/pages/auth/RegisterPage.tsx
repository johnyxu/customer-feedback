import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { registerWithPassword, loginWithGoogle } from '@api/auth'
import { BackButton } from '@components/ui/BackButton'
import { LocaleSwitcher } from '@components/ui/LocaleSwitcher'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function calcStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0
  let s = 0
  if (pwd.length >= 8) s++
  if (pwd.length >= 12) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/\d/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return Math.min(4, s) as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_COLORS = ['bg-gray-200', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'] as const

export function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedEmail = email.trim()
  const emailValid = emailRegex.test(trimmedEmail)
  const strength = useMemo(() => calcStrength(password), [password])
  const confirmMatch = confirm.length > 0 && confirm === password
  const confirmMismatch = confirm.length > 0 && confirm !== password

  function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential
    if (!idToken) return
    setError(null)
    setIsLoading(true)
    loginWithGoogle(idToken)
      .then(() => navigate('/feedback/list'))
      .catch(err => {
        setError(err instanceof Error ? err.message : t(I18N_KEYS.AUTH_REGISTER_FAILED))
        setIsLoading(false)
      })
  }

  const strengthLabel =
    [
      '',
      t(I18N_KEYS.AUTH_REGISTER_STRENGTH_WEAK),
      t(I18N_KEYS.AUTH_REGISTER_STRENGTH_FAIR),
      t(I18N_KEYS.AUTH_REGISTER_STRENGTH_GOOD),
      t(I18N_KEYS.AUTH_REGISTER_STRENGTH_STRONG),
    ][strength] ?? ''

  const canSubmit = emailValid && strength >= 2 && confirmMatch && agreed && !isLoading

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setIsLoading(true)
    try {
      await registerWithPassword(trimmedEmail, password)
      navigate('/feedback/list')
    } catch (err) {
      setError(err instanceof Error ? err.message : t(I18N_KEYS.AUTH_REGISTER_FAILED))
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
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
          <h1 className="text-2xl font-black leading-tight">{t(I18N_KEYS.AUTH_REGISTER_TITLE)}</h1>
          <p className="mt-1.5 text-sm text-white/80">{t(I18N_KEYS.AUTH_REGISTER_SUBTITLE)}</p>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {/* Google button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t(I18N_KEYS.AUTH_REGISTER_FAILED))}
            width={361}
            text="signup_with"
            shape="rectangular"
            logo_alignment="center"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">{t(I18N_KEYS.AUTH_REGISTER_DIVIDER)}</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Form */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" onKeyDown={handleKeyDown}>
          {/* Email */}
          <label htmlFor="reg-email" className="block text-xs text-gray-500">
            {t(I18N_KEYS.AUTH_REGISTER_EMAIL_LABEL)}
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
              id="reg-email"
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
            {emailValid && trimmedEmail && (
              <svg
                className="shrink-0 text-emerald-500"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <p
            className={[
              'mt-1 text-xs',
              trimmedEmail.length === 0 ? 'text-gray-400' : emailValid ? 'text-emerald-600' : 'text-rose-600',
            ].join(' ')}
          >
            {trimmedEmail.length === 0
              ? t(I18N_KEYS.AUTH_REGISTER_EMAIL_HINT_EMPTY)
              : emailValid
                ? t(I18N_KEYS.AUTH_REGISTER_EMAIL_HINT_VALID)
                : t(I18N_KEYS.AUTH_REGISTER_EMAIL_HINT_INVALID)}
          </p>

          {/* Password */}
          <label htmlFor="reg-password" className="mt-3 block text-xs text-gray-500">
            {t(I18N_KEYS.AUTH_REGISTER_PASSWORD_LABEL)}
          </label>
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
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setError(null)
                setPassword(e.target.value)
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-full flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="text-gray-400"
              aria-label="toggle"
            >
              {showPassword ? (
                <svg
                  width="14"
                  height="14"
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
                  width="14"
                  height="14"
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
          {/* Strength bar */}
          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {([1, 2, 3, 4] as const).map(n => (
                  <div
                    key={n}
                    className={[
                      'flex-1 h-1 rounded-full transition-colors',
                      n <= strength ? STRENGTH_COLORS[strength] : 'bg-gray-200',
                    ].join(' ')}
                  />
                ))}
              </div>
              <span
                className={[
                  'text-xs',
                  strength <= 1 ? 'text-rose-500' : strength <= 2 ? 'text-amber-500' : 'text-emerald-600',
                ].join(' ')}
              >
                {strengthLabel}
              </span>
            </div>
          )}

          {/* Confirm password */}
          <label htmlFor="reg-confirm" className="mt-3 block text-xs text-gray-500">
            {t(I18N_KEYS.AUTH_REGISTER_CONFIRM_LABEL)}
          </label>
          <div
            className={[
              'mt-1 flex h-11 items-center gap-2 rounded-xl border px-3 transition-colors',
              confirm.length === 0
                ? 'border-gray-200 bg-gray-50'
                : confirmMatch
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-rose-300 bg-rose-50',
            ].join(' ')}
          >
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
              id="reg-confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-full flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            {confirmMatch && (
              <svg
                className="shrink-0 text-emerald-500"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          {confirmMismatch && (
            <p className="mt-1 text-xs text-rose-600">{t(I18N_KEYS.AUTH_REGISTER_CONFIRM_MISMATCH)}</p>
          )}

          {/* Agree */}
          <label className="mt-4 flex items-start gap-2.5 cursor-pointer select-none">
            <span
              className={[
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                agreed ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white',
              ].join(' ')}
              role="checkbox"
              aria-checked={agreed}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') setAgreed(v => !v)
              }}
            >
              {agreed && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <input type="checkbox" className="sr-only" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <p className="text-xs leading-relaxed text-gray-500">
              {t(I18N_KEYS.AUTH_REGISTER_AGREE_PREFIX)}{' '}
              <span className="font-medium text-indigo-600">{t(I18N_KEYS.AUTH_REGISTER_AGREE_TERMS)}</span>{' '}
              {t(I18N_KEYS.AUTH_REGISTER_AGREE_AND)}{' '}
              <span className="font-medium text-indigo-600">{t(I18N_KEYS.AUTH_REGISTER_AGREE_PRIVACY)}</span>
            </p>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-4 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            {isLoading ? t(I18N_KEYS.AUTH_REGISTER_SUBMITTING) : t(I18N_KEYS.AUTH_REGISTER_SUBMIT)}
          </button>

          {error && (
            <p className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
          )}
        </section>

        {/* Login link */}
        <p className="text-center text-xs text-gray-500">
          {t(I18N_KEYS.AUTH_REGISTER_HAS_ACCOUNT)}{' '}
          <button type="button" onClick={() => navigate('/auth/login')} className="font-semibold text-indigo-600">
            {t(I18N_KEYS.AUTH_REGISTER_LOGIN_LINK)}
          </button>
        </p>
      </div>
    </div>
  )
}
