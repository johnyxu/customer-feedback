import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LocaleSwitcher } from '../../components/ui/LocaleSwitcher'

const CODE_LENGTH = 6
const RESEND_SECONDS = 45

export function FeedbackVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = location.state as { email?: string } | null
  const email = routeState?.email?.trim() || 'you@example.com'

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(''))
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const code = useMemo(() => digits.join(''), [digits])
  const canSubmit = /^\d{6}$/.test(code)
  const canResend = secondsLeft === 0

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
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)

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

  function handleResend() {
    if (!canResend) return
    setDigits(Array(CODE_LENGTH).fill(''))
    setSecondsLeft(RESEND_SECONDS)
    focusCell(0)
  }

  function handleConfirm() {
    if (!canSubmit) return
    // UI-only flow for now. Backend verification will be connected later.
    navigate('/feedback/list')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-gray-900">
      <header className="border-b border-slate-200 bg-white px-4 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/feedback/start')}
            className="h-9 w-9 rounded-full bg-slate-100 text-slate-600"
            aria-label="back"
          >
            ‹
          </button>
          <h1 className="font-bold">验证邮箱</h1>
          <LocaleSwitcher />
        </div>
      </header>

      <main className="space-y-4 px-4 py-5">
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold">验证码已发送到你的邮箱</h2>
          <p className="mt-1 text-sm text-slate-500">
            请在 10 分钟内输入 6 位验证码，验证通过后即可继续填写反馈并接收管理员回复。
          </p>

          <p className="mt-4 text-xs text-slate-500">邮箱</p>
          <p className="text-sm font-semibold text-slate-800 break-all">{email}</p>

          <p className="mt-4 text-xs text-slate-500">验证码</p>
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
            {canSubmit ? '验证码格式正确，可继续。' : '支持粘贴 6 位数字验证码。'}
          </p>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="mt-4 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            确认并继续
          </button>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">未收到邮件？</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={canResend ? 'font-semibold text-indigo-600' : 'cursor-not-allowed font-semibold text-slate-400'}
            >
              {canResend ? '重新发送验证码' : `${secondsLeft}s 后重新发送`}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
