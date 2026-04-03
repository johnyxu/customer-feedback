import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LocaleSwitcher } from '@components/ui/LocaleSwitcher'
import { getFeedbackThread, clearSessionToken, type FeedbackThread, type FeedbackMessage } from '@api/feedbackService'
import { BackButton } from '@components/ui/BackButton'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'
import { FollowUpBox } from '@pages/feedback/components/FollowUpBox'
import { MessageCard } from '@pages/feedback/components/MessageCard'

export function FeedbackDetailPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { feedbackId: feedbackIdParam } = useParams<{ feedbackId: string }>()
  const location = useLocation()
  const state = location.state as { feedback?: { id: string; title: string; status: string } } | null

  const [thread, setThread] = useState<FeedbackThread | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const feedbackId = feedbackIdParam ?? state?.feedback?.id ?? ''

  useEffect(() => {
    if (!feedbackId) {
      navigate('/feedback/list')
      return
    }
    let cancelled = false
    getFeedbackThread(feedbackId)
      .then(data => {
        if (!cancelled) setThread(data)
      })
      .catch((err: Error) => {
        if (cancelled) return
        if (err.message.includes('401')) {
          clearSessionToken()
          navigate('/')
          return
        }
        setError(t(I18N_KEYS.COMMON_LOAD_FAILED_RETRY))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [feedbackId, navigate, t])

  const messages: FeedbackMessage[] = thread
    ? [...thread.messages].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    : []

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <BackButton to="/feedback/list" />
          <h1 className="font-bold">{t(I18N_KEYS.DETAIL_PAGE_TITLE)}</h1>
          <LocaleSwitcher />
        </div>
      </header>

      <main className="space-y-3 px-4 py-4">
        {loading && <p className="py-10 text-center text-sm text-slate-400">{t(I18N_KEYS.COMMON_LOADING)}</p>}
        {!loading && error && <p className="py-10 text-center text-sm text-red-500">{error}</p>}

        {!loading && !error && thread && (
          <>
            <FollowUpBox
              feedbackId={feedbackId}
              onSuccess={updated => {
                setThread(updated)
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
              }}
            />
            {messages.map((msg, idx) => (
              <MessageCard
                key={msg.id}
                msg={msg}
                isFirst={idx === messages.length - 1}
                threadStatus={thread.status}
                threadType={thread.type}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </main>
    </div>
  )
}
