import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '@api/auth'
import { BackButton } from '@components/ui/BackButton'
import { LocaleSwitcher } from '@components/ui/LocaleSwitcher'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'

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

type Rule = { key: string; label: string; passes: boolean }

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()

  // Token and email come from the reset-link query params
  const tokenFromUrl = searchParams.get('token') ?? ''
  const emailFromUrl = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)

  const strength = useMemo(() => calcStrength(password), [password])
  const confirmMatch = confirm.length > 0 && confirm === password
  const confirmMismatch = confirm.length > 0 && confirm !== password

  const rules: Rule[] = [
    { key: 'len', label: t(I18N_KEYS.AUTH_RESET_RULE_LENGTH), passes: password.length >= 8 },
    { key: 'num', label: t(I18N_KEYS.AUTH_RESET_RULE_NUMBER), passes: /\d/.test(password) },
    { key: 'letter', label: t(I18N_KEYS.AUTH_RESET_RULE_LETTER), passes: /[A-Za-z]/.test(password) },
  ]

  const canSubmit = strength >= 2 && rules.every(r => r.passes) && confirmMatch && !isLoading

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setIsLoading(true)
    try {
      await resetPassword(emailFromUrl, tokenFromUrl, password)
      setSucceeded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(I18N_KEYS.AUTH_RESET_FAILED))
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  if (succeeded) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] font-sans">
        <div className="bg-linear-to-br from-[#0ea5e9] via-[#2563eb] to-[#4f46e5] px-4 pb-8 pt-3 text-white">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9" />
            <LocaleSwitcher variant="dark" />
          </div>
        </div>

        <div className="flex flex-col items-center px-4 py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg
              width="40"
              height="40"
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
          <h1 className="mt-5 text-xl font-black text-gray-900">{t(I18N_KEYS.AUTH_RESET_SUCCESS_TITLE)}</h1>
          <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-gray-500">
            {t(I18N_KEYS.AUTH_RESET_SUCCESS_DESC)}
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="mt-8 h-11 w-full max-w-xs rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)]"
          >
            {t(I18N_KEYS.AUTH_RESET_GO_LOGIN)}
          </button>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-black leading-tight">{t(I18N_KEYS.AUTH_RESET_TITLE)}</h1>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {/* Identity badge */}
        {emailFromUrl && (
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-800">{t(I18N_KEYS.AUTH_RESET_VERIFIED_LABEL)}</p>
              <p className="text-xs text-indigo-600">{emailFromUrl}</p>
            </div>
            <svg
              className="ml-auto shrink-0 text-indigo-400"
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
          </div>
        )}

        {/* Form */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" onKeyDown={handleKeyDown}>
          {/* New password */}
          <label htmlFor="reset-password" className="block text-xs text-gray-500">
            {t(I18N_KEYS.AUTH_RESET_PASSWORD_LABEL)}
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
              id="reset-password"
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

          {/* Strength */}
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
            </div>
          )}

          {/* Rules checklist */}
          {password.length > 0 && (
            <ul className="mt-2 space-y-1">
              {rules.map(rule => (
                <li
                  key={rule.key}
                  className={[
                    'flex items-center gap-1.5 text-xs',
                    rule.passes ? 'text-emerald-600' : 'text-gray-400',
                  ].join(' ')}
                >
                  {rule.passes ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                  {rule.label}
                </li>
              ))}
            </ul>
          )}

          {/* Confirm */}
          <label htmlFor="reset-confirm" className="mt-3 block text-xs text-gray-500">
            {t(I18N_KEYS.AUTH_RESET_CONFIRM_LABEL)}
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
              id="reset-confirm"
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
          {confirmMismatch && <p className="mt-1 text-xs text-rose-600">{t(I18N_KEYS.AUTH_RESET_CONFIRM_MISMATCH)}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-4 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            {isLoading ? t(I18N_KEYS.AUTH_RESET_SUBMITTING) : t(I18N_KEYS.AUTH_RESET_SUBMIT)}
          </button>

          {error && (
            <p className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
          )}
        </section>
      </div>
    </div>
  )
}
