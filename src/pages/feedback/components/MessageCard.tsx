import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { feedbackTypeLabel, statusChip } from '@api/feedbackService'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'
import { formatTime } from '@utils/date'
import type { FeedbackMessage, FeedbackStatus } from '@/types/api-contracts'

type Props = {
  msg: FeedbackMessage
  isFirst: boolean
  threadStatus: FeedbackStatus
  threadType: string
}

export function MessageCard({ msg, isFirst, threadStatus, threadType }: Props) {
  const { locale, t } = useI18n()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const isCustomer = msg.sender === 'customer'
  const images = msg.attachments.filter(a => /\.(png|jpe?g|gif|webp)$/i.test(a.filename))
  const files = msg.attachments.filter(a => !/\.(png|jpe?g|gif|webp)$/i.test(a.filename))
  const badge = statusChip(threadStatus, locale)

  const handlePrevImage = () => {
    setSelectedImageIndex(prev => (prev === null ? null : (prev - 1 + images.length) % images.length))
  }

  const handleNextImage = () => {
    setSelectedImageIndex(prev => (prev === null ? null : (prev + 1) % images.length))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => (prev !== null ? (prev - 1 + images.length) % images.length : 0))
      }
      if (e.key === 'ArrowRight') {
        setSelectedImageIndex(prev => (prev !== null ? (prev + 1) % images.length : 0))
      }
      if (e.key === 'Escape') setSelectedImageIndex(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageIndex, images.length])

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
            {isCustomer ? t(I18N_KEYS.MESSAGE_ROLE_CUSTOMER_SHORT) : t(I18N_KEYS.MESSAGE_ROLE_ADMIN_SHORT)}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">
              {isCustomer ? t(I18N_KEYS.MESSAGE_ROLE_CUSTOMER_NAME) : t(I18N_KEYS.MESSAGE_ROLE_SUPPORT_NAME)}
            </p>
            <p className="text-[10px] text-slate-400">{formatTime(msg.createdAt, locale)}</p>
          </div>
        </div>

        {isCustomer && (
          <div className="flex items-center gap-1.5">
            {isFirst && <span className="text-[11px] text-slate-400">{feedbackTypeLabel(threadType, locale)}</span>}
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
          {images.map((att, idx) => (
            <button
              key={att.id}
              onClick={() => setSelectedImageIndex(idx)}
              className="block cursor-pointer hover:opacity-80 transition-opacity"
              type="button"
            >
              <img
                src={att.url}
                alt={att.filename}
                className="h-32 w-32 rounded-xl border border-slate-100 object-cover"
              />
            </button>
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

      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedImageIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={images[selectedImageIndex]?.url}
              alt="Enlarged preview"
              className="max-h-[calc(90vh-50px)] w-auto rounded-xl object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/40 shadow-lg hover:bg-slate-800/60 transition-colors"
                  type="button"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/40 shadow-lg hover:bg-slate-800/60 transition-colors"
                  type="button"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-800/40 px-3 py-1 text-xs text-white shadow-lg">
                  {selectedImageIndex + 1} / {images.length}
                </span>
              </>
            )}

            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/40 shadow-lg hover:bg-slate-800/60 transition-colors"
              type="button"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
