import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { NavBar } from '../../components/ui/NavBar'
import { LocaleSwitcher } from '../../components/ui/LocaleSwitcher'
import { BackButton } from '../../components/ui/BackButton'
import { TypeChipGroup, type FeedbackTypeId } from './components/TypeChipGroup'
import { StarRating } from './components/StarRating'
import { UploadBox } from './components/UploadBox'
import { useI18n } from '../../i18n/useI18n'
import {
  uploadFiles,
  submitFeedback,
  submitAnonymousFeedback,
  getSessionToken,
  clearSessionToken,
} from '../../api/feedbackService'
import type { AttachmentPayload } from '../../api/uploadService'

// Shared input style reused by <input> and <textarea>
const inputCls =
  'w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-[11px] text-sm text-gray-900 bg-white outline-none box-border transition-all focus:border-violet-600 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]'

export function FeedbackPage() {
  const navigate = useNavigate()

  const { locale, t } = useI18n()
  const [feedbackType, setFeedbackType] = useState<FeedbackTypeId>('bug')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  async function handleSubmit() {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setUploadProgress(0)
    try {
      let attachments: AttachmentPayload[] = []

      if (files.length > 0) {
        attachments = await uploadFiles(files, (_idx, loaded, total) => {
          if (total === 0) return
          setUploadProgress(Math.round((loaded / total) * 100))
        })
      }

      const feedbackData = {
        type: feedbackType,
        content: content.trim(),
        rating,
        locale,
        attachments,
      }

      let isAnonymous = false
      if (getSessionToken()) {
        // 邮箱流程：token 已存入 sessionStorage，buildHeaders 会自动携带 Authorization
        try {
          await submitFeedback(feedbackData)
        } catch (err) {
          // token 已过期或失效，清除后降级为匿名提交
          if (err instanceof Error && err.message.includes('401')) {
            clearSessionToken()
            await submitAnonymousFeedback(feedbackData)
            isAnonymous = true
          } else {
            throw err
          }
        }
      } else {
        // 匿名流程
        await submitAnonymousFeedback(feedbackData)
        isAnonymous = true
      }

      setUploadProgress(100)
      setSubmitted(true)
      setFiles([])
      setTimeout(() => {
        setSubmitted(false)
        navigate(isAnonymous ? '/' : '/feedback/list')
      }, 2000)
    } catch (error) {
      console.error('Submit feedback failed:', error)
    } finally {
      setUploadProgress(0)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      {/* Gradient header: nav + hero blended */}
      <div className="bg-linear-to-br from-[#667eea] to-[#764ba2] px-4 pb-5">
        <NavBar title={t('nav.title')} left={<BackButton variant="dark" />} right={<LocaleSwitcher variant="dark" />} />
        <div className="mt-3">
          <h1 className="text-xl font-bold text-white m-0 mb-1.5">{t('hero.title')}</h1>
          <p className="text-[13px] leading-relaxed text-white/90 m-0">{t('hero.description')}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-[5px] text-xs text-white font-semibold">
            ⚡ {t('hero.sla')}
          </div>
        </div>
      </div>

      {/* Scrollable form area — pb-[100px] leaves room for the sticky button */}
      <div className="pt-4 pb-[100px]">
        <Card>
          <SectionHeader icon="≡" title={t('section.feedbackType')} />
          <TypeChipGroup value={feedbackType} onChange={setFeedbackType} />
        </Card>

        <Card>
          <SectionHeader icon="✏" title={t('section.detail')} />
          <label className="text-[13px] font-semibold text-gray-700 block mb-2">{t('detail.label')}</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('detail.placeholder')}
            className={`${inputCls} min-h-[120px] resize-y leading-relaxed`}
          />
          <p className="text-xs text-gray-400 mt-1.5 mb-0">{t('detail.tip')}</p>
        </Card>

        <Card>
          <SectionHeader icon="★" title={t('section.rating')} />
          <StarRating value={rating} onChange={setRating} />
        </Card>

        <Card>
          <SectionHeader icon="📎" title={t('section.attachments')} />
          <UploadBox files={files} onFilesChange={setFiles} />
        </Card>
      </div>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-2.5 pb-[18px] bg-linear-to-t from-[#f5f5f7] via-[rgba(245,245,247,0.9)] to-transparent pointer-events-none">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="pointer-events-auto w-full border-0 rounded-xl bg-linear-to-br from-[#667eea] to-[#764ba2] text-white text-[15px] font-bold py-[13px] cursor-pointer shadow-[0_8px_20px_rgba(102,126,234,0.3)] active:scale-[0.99] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? `Uploading... ${uploadProgress}%` : `✈ ${t('submit.button')}`}
        </button>
      </div>

      {/* Success toast */}
      {submitted && (
        <div className="fixed left-4 right-4 bottom-[22px] bg-gray-900 text-white rounded-xl px-3.5 py-3 flex items-center gap-2 text-[13px] shadow-[0_10px_26px_rgba(0,0,0,0.28)] z-50">
          <span className="text-emerald-400 text-base">✓</span>
          <span>{t('submit.success')}</span>
        </div>
      )}
    </div>
  )
}
