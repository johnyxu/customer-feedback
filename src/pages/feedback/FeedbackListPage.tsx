import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LocaleSwitcher } from '../../components/ui/LocaleSwitcher'
import { listFeedback, clearSessionToken, type FeedbackListItem, type FeedbackStatus } from '../../api/feedbackService'

function formatUpdatedAt(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days === 1) return '昨天'
  if (days < 30) return `${days} 天前`
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

const TYPE_LABEL: Record<string, string> = {
  bug: '问题反馈',
  feature: '功能建议',
  experience: '体验问题',
  other: '其他',
}

function statusChip(status: FeedbackStatus): { label: string; className: string } {
  if (status === 'new') {
    return {
      label: '待处理',
      className: 'bg-blue-50 text-blue-600',
    }
  }

  if (status === 'reviewed') {
    return {
      label: '处理中',
      className: 'bg-amber-50 text-amber-700',
    }
  }

  if (status === 'replied') {
    return {
      label: '管理员已回复',
      className: 'bg-emerald-50 text-emerald-700',
    }
  }

  return {
    label: '已解决',
    className: 'bg-slate-100 text-slate-600',
  }
}

export function FeedbackListPage() {
  const navigate = useNavigate()

  const [feedbacks, setFeedbacks] = useState<FeedbackListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listFeedback()
      .then(data => {
        if (!cancelled) setFeedbacks(data)
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
  }, [navigate])

  const repliedCount = useMemo(
    () =>
      feedbacks.filter(
        item => item.status === 'replied' || item.status === 'resolved' || item.latestAdminReply !== null,
      ).length,
    [feedbacks],
  )

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">我的反馈</h1>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main className="space-y-3 px-4 py-4">
        {loading && <p className="py-10 text-center text-sm text-slate-400">加载中…</p>}

        {!loading && error && <p className="py-10 text-center text-sm text-red-500">{error}</p>}

        {!loading && !error && feedbacks.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">暂无反馈记录</p>
        )}

        {!loading && !error && feedbacks.length > 0 && (
          <>
            <section className="rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#4f46e5] p-4 text-white">
              <p className="text-xs text-white/80">反馈处理概览</p>
              <p className="mt-1 text-2xl font-black">{Math.round((repliedCount / feedbacks.length) * 100)}%</p>
              <p className="mt-1 text-xs text-white/80">
                {repliedCount}/{feedbacks.length} 条已得到回复或解决
              </p>
            </section>

            {feedbacks.map(item => {
              const chip = statusChip(item.status)
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/feedback/detail/${item.id}`)}
                  onKeyDown={event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    navigate(`/feedback/detail/${item.id}`)
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700">{TYPE_LABEL[item.type] ?? item.type}</p>
                    </div>
                    <span
                      className={['shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold', chip.className].join(
                        ' ',
                      )}
                    >
                      {chip.label}
                    </span>
                  </div>

                  {item.firstCustomerMessage?.content && (
                    <p className="mt-1.5 truncate text-sm text-slate-600">{item.firstCustomerMessage.content}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>⭐ {item.rating}</span>
                    <span>{formatUpdatedAt(item.updatedAt)}</span>
                  </div>

                  <div className="mt-2 text-right text-xs font-semibold text-indigo-600">查看详情 ›</div>
                </article>
              )
            })}
          </>
        )}
      </main>
    </div>
  )
}
