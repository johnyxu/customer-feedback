import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { sendEmailVerificationCode, verifyEmailCode } from '@api/feedbackService'
import { BackButton } from '@components/ui/BackButton'
import { LocaleSwitcher } from '@components/ui/LocaleSwitcher'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'

const CODE_LENGTH = 6
const RESEND_SECONDS = 45

export function FeedbackVerifyPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const location = useLocation()
  const routeState = location.state as { email?: string } | null
  const email = routeState?.email?.trim() || 'you@example.com'

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(''))
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const code = useMemo(() => digits.join(''), [digits])
  const canSubmit = /^\d{6}$/.test(code)
  const canResend = secondsLeft === 0

  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  useEffect(() => {
    const first = inputRefs.current[0]
    first?.focus()
  }, [])

  useEffect(() => {
    if (secondsLeft === 0) return
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsLeft])

  function focusCell(index: number) {
    const clamped = Math.max(0, Math.min(CODE_LENGTH - 1, index))
    inputRefs.current[clamped]?.focus()
  }

  function updateDigit(index: number, next: string) {
    const value = next.replace(/\D/g, '').slice(0, 1)
    setDigits(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })

    if (value && index < CODE_LENGTH - 1) {
      focusCell(index + 1)
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusCell(index - 1)
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)

    if (!pasted) return

    setDigits(() => {
      const next = Array(CODE_LENGTH).fill('')
      for (let i = 0; i < pasted.length; i += 1) {
        next[i] = pasted[i]
      }
      return next
    })

    focusCell(Math.min(pasted.length, CODE_LENGTH - 1))
  }

  async function handleResend() {
    if (!canResend) return
    setVerifyError(null)
    try {
      await sendEmailVerificationCode(email)
    } catch {
      // Keep UI interactive even when resend fails; user can retry.
    }
    setDigits(Array(CODE_LENGTH).fill(''))
    setSecondsLeft(RESEND_SECONDS)
    focusCell(0)
  }

  async function handleConfirm() {
    if (!canSubmit || isVerifying) return
    setVerifyError(null)
    setIsVerifying(true)
    try {
      await verifyEmailCode(email, code)
      navigate('/feedback', { state: { email } })
    } catch {
      setVerifyError(t(I18N_KEYS.VERIFY_ERROR_INVALID_CODE))
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-gray-900">
      <header className="border-b border-slate-200 bg-white px-4 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <BackButton to="/feedback/start" />
          <h1 className="font-bold">{t(I18N_KEYS.VERIFY_PAGE_TITLE)}</h1>
          <LocaleSwitcher />
        </div>
      </header>

      <main className="space-y-4 px-4 py-5">
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold">{t(I18N_KEYS.VERIFY_SENT_TITLE)}</h2>
          <p className="mt-1 text-sm text-slate-500">{t(I18N_KEYS.VERIFY_SENT_DESC)}</p>

          <p className="mt-4 text-xs text-slate-500">{t(I18N_KEYS.VERIFY_EMAIL_LABEL)}</p>
          <p className="text-sm font-semibold text-slate-800 break-all">{email}</p>

          <p className="mt-4 text-xs text-slate-500">{t(I18N_KEYS.VERIFY_CODE_LABEL)}</p>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {digits.map((digit, index) => {
              const active = index === digits.findIndex(item => item === '') || (digits.every(Boolean) && index === 5)
              return (
                <input
                  key={index}
                  ref={node => {
                    inputRefs.current[index] = node
                  }}
                  value={digit}
                  onChange={event => updateDigit(index, event.target.value)}
                  onKeyDown={event => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  className={[
                    'h-11 rounded-lg border text-center text-base font-bold outline-none transition-colors',
                    active
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-800',
                  ].join(' ')}
                />
              )
            })}
          </div>

          <p className={['mt-2 text-xs', canSubmit ? 'text-emerald-600' : 'text-slate-400'].join(' ')}>
            {canSubmit ? t(I18N_KEYS.VERIFY_HINT_VALID) : t(I18N_KEYS.VERIFY_HINT_PASTE)}
          </p>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit || isVerifying}
            className="mt-4 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            {isVerifying ? t(I18N_KEYS.VERIFY_SUBMITTING) : t(I18N_KEYS.VERIFY_SUBMIT)}
          </button>

          {verifyError && (
            <p className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {verifyError}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t(I18N_KEYS.VERIFY_NOT_RECEIVED)}</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={
                canResend ? 'font-semibold text-indigo-600' : 'cursor-not-allowed font-semibold text-slate-400'
              }
            >
              {canResend ? t(I18N_KEYS.VERIFY_RESEND) : `${secondsLeft}s ${t(I18N_KEYS.VERIFY_RESEND_AFTER_SUFFIX)}`}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
