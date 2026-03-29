import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LocaleSwitcher } from '../../components/ui/LocaleSwitcher'

type FeedbackStatus = 'replied' | 'processing' | 'resolved'

type FeedbackItem = {
  id: string
  title: string
  summary: string
  status: FeedbackStatus
  updatedAt: string
  messageCount: number
}

const MOCK_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'FB-20260329-018',
    title: 'iOS 端支付后页面卡住',
    summary: '客服已定位到 iOS 17 WebView 缓存问题，已给出临时处理方案。',
    status: 'replied',
    updatedAt: '10 分钟前更新',
    messageCount: 3,
  },
  {
    id: 'FB-20260328-146',
    title: '希望增加深色模式',
    summary: '产品侧已接收需求，正在评估设计与研发排期。',
    status: 'processing',
    updatedAt: '昨天',
    messageCount: 1,
  },
  {
    id: 'FB-20260320-093',
    title: '视频上传失败（大文件）',
    summary: '已上线优化方案，建议升级到最新版本后重试。',
    status: 'resolved',
    updatedAt: '3 月 20 日',
    messageCount: 5,
  },
]

function statusChip(status: FeedbackStatus): { label: string; className: string } {
  if (status === 'replied') {
    return {
      label: '管理员已回复',
      className: 'bg-emerald-50 text-emerald-700',
    }
  }

  if (status === 'processing') {
    return {
      label: '处理中',
      className: 'bg-amber-50 text-amber-700',
    }
  }

  return {
    label: '已解决',
    className: 'bg-slate-100 text-slate-600',
  }
}

export function FeedbackListPage() {
  const navigate = useNavigate()

  const repliedCount = useMemo(
    () => MOCK_FEEDBACKS.filter(item => item.status === 'replied' || item.status === 'resolved').length,
    [],
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
        <section className="rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#4f46e5] p-4 text-white">
          <p className="text-xs text-white/80">反馈处理概览</p>
          <p className="mt-1 text-2xl font-black">{Math.round((repliedCount / MOCK_FEEDBACKS.length) * 100)}%</p>
          <p className="mt-1 text-xs text-white/80">{repliedCount}/{MOCK_FEEDBACKS.length} 条已得到回复或解决</p>
        </section>

        {MOCK_FEEDBACKS.map(item => {
          const chip = statusChip(item.status)
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate('/feedback/detail', {
                  state: {
                    feedback: {
                      id: item.id,
                      title: item.title,
                      status: item.status,
                    },
                  },
                })
              }
              onKeyDown={event => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                navigate('/feedback/detail', {
                  state: {
                    feedback: {
                      id: item.id,
                      title: item.title,
                      status: item.status,
                    },
                  },
                })
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500">#{item.id}</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">{item.title}</h2>
                </div>
                <span className={['rounded-full px-2 py-1 text-[11px] font-semibold', chip.className].join(' ')}>
                  {chip.label}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.summary}</p>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{item.messageCount} 条对话</span>
                <span>{item.updatedAt}</span>
              </div>

              <div className="mt-2 text-right text-xs font-semibold text-indigo-600">查看详情 ›</div>
            </article>
          )
        })}
      </main>
    </div>
  )
}
