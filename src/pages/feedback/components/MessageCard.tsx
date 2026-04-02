import {
  FEEDBACK_TYPE_LABEL,
  statusChip,
  type FeedbackMessage,
  type FeedbackStatus,
} from '../../../api/feedbackService'
import { formatTime } from '../../../utils/date'

type Props = {
  msg: FeedbackMessage
  isFirst: boolean
  threadStatus: FeedbackStatus
  threadType: string
}

export function MessageCard({ msg, isFirst, threadStatus, threadType }: Props) {
  const isCustomer = msg.sender === 'customer'
  const images = msg.attachments.filter(a => /\.(png|jpe?g|gif|webp)$/i.test(a.filename))
  const files = msg.attachments.filter(a => !/\.(png|jpe?g|gif|webp)$/i.test(a.filename))
  const badge = statusChip(threadStatus)

  return (
    <section
      className={[
        'rounded-2xl border bg-white p-4 shadow-sm',
        isCustomer ? 'border-slate-100' : 'border-indigo-100',
      ].join(' ')}
    >
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

        {isCustomer && (
          <div className="flex items-center gap-1.5">
            {isFirst && (
              <span className="text-[11px] text-slate-400">{FEEDBACK_TYPE_LABEL[threadType] ?? threadType}</span>
            )}
            <span
              className={['shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', badge.className].join(' ')}
            >
              {badge.label}
            </span>
          </div>
        )}
      </div>

      <p className="text-sm leading-relaxed text-slate-800">{msg.content}</p>

      {images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map(att => (
            <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="block">
              <img
                src={att.url}
                alt={att.filename}
                className="h-32 w-32 rounded-xl border border-slate-100 object-cover"
              />
            </a>
          ))}
        </div>
      )}

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
}
