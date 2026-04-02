import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LocaleSwitcher } from '../../components/ui/LocaleSwitcher'
import {
  getFeedbackThread,
  submitFollowUp,
  uploadFiles,
  clearSessionToken,
  type AttachmentPayload,
  type FeedbackThread,
  type FeedbackMessage,
} from '../../api/feedbackService'
import { UploadBox } from './components/UploadBox'

function formatTime(input: string): string {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

function statusBadge(status: string): { label: string; cls: string } {
  if (status === 'replied') return { label: '管理员已回复', cls: 'bg-emerald-50 text-emerald-700' }
  if (status === 'processing') return { label: '处理中', cls: 'bg-amber-50 text-amber-700' }
  if (status === 'resolved') return { label: '已解决', cls: 'bg-slate-100 text-slate-700' }
  return { label: '待处理', cls: 'bg-blue-50 text-blue-600' }
}

const TYPE_LABEL: Record<string, string> = {
  bug: '问题反馈',
  feature: '功能建议',
  experience: '体验问题',
  other: '其他',
}

export function FeedbackDetailPage() {
  const navigate = useNavigate()
  const { feedbackId: feedbackIdParam } = useParams<{ feedbackId: string }>()
  const location = useLocation()
  const state = location.state as {
    feedback?: { id: string; title: string; status: string }
  } | null

  const [thread, setThread] = useState<FeedbackThread | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [replyText, setReplyText] = useState('')
  const [replyFiles, setReplyFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

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

  // 新消息加载后滚动到底部
  useEffect(() => {
    if (!loading && thread) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [loading, thread])

  async function handleSubmitFollowUp() {
    if (!replyText.trim() || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    setUploadProgress(0)
    try {
      let attachments: AttachmentPayload[] = []
      if (replyFiles.length > 0) {
        attachments = await uploadFiles(replyFiles, (_idx, loaded, total) => {
          if (total > 0) setUploadProgress(Math.round((loaded / total) * 100))
        })
      }
      await submitFollowUp(feedbackId, replyText.trim(), attachments)
      const updated = await getFeedbackThread(feedbackId)
      setThread(updated)
      setReplyText('')
      setReplyFiles([])
      setUploadProgress(0)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      setSubmitError('发送失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const messages: FeedbackMessage[] = thread
    ? [...thread.messages].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    : []

  const badge = thread ? statusBadge(thread.status) : null

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
            {/* 跟进回复输入框 */}
            <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-semibold text-slate-500">继续跟进回复</p>
              {submitError && <p className="mb-1 text-xs text-red-500">{submitError}</p>}
              <textarea
                rows={2}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="输入补充说明或追问…"
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitFollowUp()
                }}
              />
              <div className="mt-2">
                <UploadBox files={replyFiles} onFilesChange={setReplyFiles} />
              </div>
              {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[10px] text-slate-400">上传中 {uploadProgress}%</p>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-slate-400">⌘ + Enter 快速发送</p>
                <button
                  type="button"
                  disabled={!replyText.trim() || submitting}
                  onClick={handleSubmitFollowUp}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-40"
                >
                  {submitting ? '发送中…' : '发送'}
                </button>
              </div>
            </section>

            {/* 消息列表（倒序，最新在上） */}
            {messages.map((msg, idx) => {
              const isCustomer = msg.sender === 'customer'
              const isFirst = idx === messages.length - 1 // 时间最早的一条（倒序排列时最后一项）
              const images = msg.attachments.filter(a => /\.(png|jpe?g|gif|webp)$/i.test(a.filename))
              const files = msg.attachments.filter(a => !/\.(png|jpe?g|gif|webp)$/i.test(a.filename))

              return (
                <section
                  key={msg.id}
                  className={[
                    'rounded-2xl border bg-white p-4 shadow-sm',
                    isCustomer ? 'border-slate-100' : 'border-indigo-100',
                  ].join(' ')}
                >
                  {/* 卡片头部：发送者 + 时间 + 首条状态 badge */}
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
                          isCustomer ? 'bg-indigo-500' : 'bg-emerald-500',
                        ].join(' ')}
                      >
                        {isCustomer ? '我' : '客'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{isCustomer ? '我' : '小竹客服'}</p>
                        <p className="text-[10px] text-slate-400">{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                    {/* 首条消息显示反馈类型 + 状态 */}
                    {badge && (
                      <div className="flex items-center gap-1.5">
                        {isFirst && (
                          <span className="text-[11px] text-slate-400">{TYPE_LABEL[thread.type] ?? thread.type}</span>
                        )}
                        <span
                          className={['shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', badge.cls].join(
                            ' ',
                          )}
                        >
                          {badge.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 消息内容 */}
                  <p className="text-sm leading-relaxed text-slate-800">{msg.content}</p>

                  {/* 图片附件 */}
                  {images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {images.map(att => (
                        <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="block">
                          <img
                            src={att.url}
                            alt={att.filename}
                            className="h-32 w-32 rounded-xl object-cover border border-slate-100"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* 文件附件 */}
                  {files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {files.map(att => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-indigo-600 underline"
                        >
                          📎 {att.filename}
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              )
            })}

            <div ref={bottomRef} />
          </>
        )}
      </main>
    </div>
  )
}
