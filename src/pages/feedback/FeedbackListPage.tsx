import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { feedbackTypeLabel, listFeedback, clearSessionToken, statusChip } from '@api/feedbackService'
import type { FeedbackListItem } from '@/types/api-contracts'
import { LocaleSwitcher } from '@components/ui/LocaleSwitcher'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'
import { formatUpdatedAt } from '@utils/date'

export function FeedbackListPage() {
  const navigate = useNavigate()
  const { locale, t } = useI18n()

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
        setError(t(I18N_KEYS.COMMON_LOAD_FAILED_RETRY))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [navigate, t])

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
          <h1 className="text-lg font-bold">{t(I18N_KEYS.LIST_TITLE)}</h1>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main className="space-y-3 px-4 py-4">
        {loading && <p className="py-10 text-center text-sm text-slate-400">{t(I18N_KEYS.COMMON_LOADING)}</p>}

        {!loading && error && <p className="py-10 text-center text-sm text-red-500">{error}</p>}

        {!loading && !error && feedbacks.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">{t(I18N_KEYS.LIST_EMPTY)}</p>
        )}

        {!loading && !error && feedbacks.length > 0 && (
          <>
            <section className="rounded-2xl bg-linear-to-br from-[#2563eb] to-[#4f46e5] p-4 text-white">
              <p className="text-xs text-white/80">{t(I18N_KEYS.LIST_OVERVIEW)}</p>
              <p className="mt-1 text-2xl font-black">{Math.round((repliedCount / feedbacks.length) * 100)}%</p>
              <p className="mt-1 text-xs text-white/80">
                {repliedCount}/{feedbacks.length} {t(I18N_KEYS.LIST_REPLIED_SUMMARY_SUFFIX)}
              </p>
            </section>

            {feedbacks.map(item => {
              const chip = statusChip(item.status, locale)
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/feedback/${item.id}/detail`)}
                  onKeyDown={event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    navigate(`/feedback/${item.id}/detail`)
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700">{feedbackTypeLabel(item.type, locale)}</p>
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

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>⭐ {item.rating}</span>
                      <span>
                        {item.messageCount} {t(I18N_KEYS.LIST_MESSAGE_COUNT)}
                      </span>
                    </div>
                    <span>{formatUpdatedAt(item.updatedAt, locale)}</span>
                  </div>

                  <div className="mt-2 text-right text-xs font-semibold text-indigo-600">
                    {t(I18N_KEYS.LIST_VIEW_DETAIL)}
                  </div>
                </article>
              )
            })}
          </>
        )}
      </main>
    </div>
  )
}
