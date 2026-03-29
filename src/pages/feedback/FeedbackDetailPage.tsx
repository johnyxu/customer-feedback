import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type FeedbackSender = 'customer' | 'admin'

type FeedbackMessage = {
  id: string
  feedbackId: string
  sender: FeedbackSender
  senderId: string
  content: string
  isQuestion: boolean
  inReplyToMessageId: string | null
  createdAt: string
  attachments: string[]
}

type FeedbackSummary = {
  id: string
  title: string
  description: string
  status: 'replied' | 'processing' | 'resolved'
}

const MOCK_SUMMARY: FeedbackSummary = {
  id: '36fd8b8e-0658-4537-a031-44c9ab4eae9f',
  title: 'iOS 端支付后页面卡住',
  description: '支付成功后返回订单详情页，约 2-3 秒白屏并无响应，需强制重启 App。',
  status: 'replied',
}

const MOCK_MESSAGES: FeedbackMessage[] = [
  {
    id: '0116a5d5-3ab5-4d9b-8fac-2ac3900321a7',
    feedbackId: '36fd8b8e-0658-4537-a031-44c9ab4eae9f',
    sender: 'customer',
    senderId: 'user123',
    content: '页面有报错',
    isQuestion: true,
    inReplyToMessageId: null,
    createdAt: '2026-03-28T20:50:52.602Z',
    attachments: [],
  },
  {
    id: 'b248eeff-c15c-4819-b0a0-3c28315f8057',
    feedbackId: '36fd8b8e-0658-4537-a031-44c9ab4eae9f',
    sender: 'admin',
    senderId: 'admin01',
    content: '已收到，我们在排查',
    isQuestion: false,
    inReplyToMessageId: '0116a5d5-3ab5-4d9b-8fac-2ac3900321a7',
    createdAt: '2026-03-28T21:00:34.025Z',
    attachments: [],
  },
  {
    id: 'a6379576-31ff-4134-9df8-fb0667ba5efc',
    feedbackId: '36fd8b8e-0658-4537-a031-44c9ab4eae9f',
    sender: 'customer',
    senderId: 'user123',
    content: '请问大概多久修复？',
    isQuestion: true,
    inReplyToMessageId: null,
    createdAt: '2026-03-28T21:03:02.628Z',
    attachments: [],
  },
]

function formatTime(input: string): string {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

type TimelineItem = {
  key: string
  title: string
  detail?: string
  time: string
  dotCls: string
}

function statusBadge(status: FeedbackSummary['status']): { label: string; cls: string } {
  if (status === 'replied') return { label: '管理员已回复', cls: 'bg-emerald-50 text-emerald-700' }
  if (status === 'processing') return { label: '处理中', cls: 'bg-amber-50 text-amber-700' }
  return { label: '已解决', cls: 'bg-slate-100 text-slate-700' }
}

export function FeedbackDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { feedback?: FeedbackSummary; messages?: FeedbackMessage[] } | null

  const feedback = state?.feedback ?? MOCK_SUMMARY
  const messages = useMemo(
    () => [...(state?.messages ?? MOCK_MESSAGES)].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    [state?.messages],
  )

  const badge = statusBadge(feedback.status)

  const firstCustomerMessage = messages.find(item => item.sender === 'customer')
  const lastAdminMessage = [...messages].reverse().find(item => item.sender === 'admin')

  const timeline = useMemo<TimelineItem[]>(() => {
    return [
      {
        key: 'admin-replied',
        title: '管理员回复：已定位问题',
        detail: lastAdminMessage?.content ?? '建议先清理缓存并重试，修复将在后续版本发布。',
        time: lastAdminMessage ? formatTime(lastAdminMessage.createdAt) : '今天 09:12',
        dotCls: 'bg-emerald-500',
      },
      {
        key: 'assigned',
        title: '系统：反馈已分配到研发组',
        time: '今天 08:43',
        dotCls: 'bg-indigo-500',
      },
      {
        key: 'created',
        title: '你提交了反馈',
        time: firstCustomerMessage ? formatTime(firstCustomerMessage.createdAt) : '今天 08:39',
        dotCls: 'bg-slate-300',
      },
    ]
  }, [firstCustomerMessage, lastAdminMessage])

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
          <button type="button" className="h-9 w-9 rounded-full bg-slate-100 text-slate-500" aria-label="more">
            …
          </button>
        </div>
      </header>

      <main className="space-y-3 px-4 py-4 pb-28">
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">#{feedback.id}</p>
              <h2 className="mt-2 text-sm font-semibold">{feedback.title}</h2>
            </div>
            <span className={['rounded-full px-2 py-1 text-[11px] font-semibold', badge.cls].join(' ')}>
              {badge.label}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{feedback.description}</p>
          <img
            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80"
            alt="issue screenshot"
            className="mt-3 h-36 w-full rounded-xl object-cover"
          />
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold">处理进展</h3>
          <ol className="mt-3 space-y-3 text-sm">
            {timeline.map(item => (
              <li key={item.key} className="flex gap-3">
                <span className={['mt-1 h-2.5 w-2.5 rounded-full', item.dotCls].join(' ')} />
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.detail && <p className="mt-1 text-xs text-slate-500">{item.detail}</p>}
                  <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold">管理员回复</h3>
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                alt="admin"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">小竹客服 · Lily</p>
                <p className="text-[11px] text-slate-500">
                  {lastAdminMessage ? formatTime(lastAdminMessage.createdAt) : '今天 09:12'}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              {lastAdminMessage?.content ??
                '我们已经复现问题，临时建议你在“设置-通用-清理缓存”后重试。你是否方便补充一下系统版本和网络环境，方便我们精准回归？'}
            </p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#f5f5f7] via-[rgba(245,245,247,0.95)] to-transparent px-4 pb-6 pt-2">
        <button
          type="button"
          onClick={() => navigate('/feedback')}
          className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
        >
          继续跟进回复
        </button>
      </div>
    </div>
  )
}
