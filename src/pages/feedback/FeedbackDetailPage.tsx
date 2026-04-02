import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LocaleSwitcher } from '../../components/ui/LocaleSwitcher'
import { getFeedbackThread, clearSessionToken, type FeedbackThread, type FeedbackMessage } from '../../api/feedbackService'
import { FollowUpBox } from './components/FollowUpBox'
import { MessageCard } from './components/MessageCard'

export function FeedbackDetailPage() {
  const navigate = useNavigate()
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
      setError('缺少反馈 ID，请从列表页重新进入')
      setLoading(false)
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
        setError('加载失败，请稍后重试')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [feedbackId, navigate])

  useEffect(() => {
    if (!loading && thread) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [loading, thread])

  const messages: FeedbackMessage[] = thread
    ? [...thread.messages].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    : []

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/feedback/list')}
            className="h-9 w-9 rounded-full bg-slate-100 text-slate-600"
            aria-label="back"
          >
            ‹
          </button>
          <h1 className="font-bold">反馈详情</h1>
          <LocaleSwitcher />
        </div>
      </header>

      <main className="space-y-3 px-4 py-4">
        {loading && <p className="py-10 text-center text-sm text-slate-400">加载中…</p>}
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
