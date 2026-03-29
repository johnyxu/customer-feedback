import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { NavBar } from '../../components/ui/NavBar'
import { TypeChipGroup, type FeedbackTypeId } from './components/TypeChipGroup'
import { StarRating } from './components/StarRating'
import { UploadBox } from './components/UploadBox'
import { useI18n } from '../../i18n/useI18n'
import type { Locale } from '../../i18n/messages'

const API_BASE_URL =
  (import.meta.env.VITE_FEEDBACK_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? '').trim()
const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()
const SIGNED_UPLOAD_PATH = (import.meta.env.VITE_SIGNED_UPLOAD_PATH ?? '/api/storage/signed-upload-url').trim()
const FEEDBACK_SUBMIT_PATH = (import.meta.env.VITE_FEEDBACK_SUBMIT_PATH ?? '/api/feedback').trim()

type SignedUploadResponse = {
  uploadUrl: string
  fileUrl: string
  requiredHeaders?: Record<string, string>
}

type AttachmentPayload = {
  url: string
  filename: string
  size: number
}

const LOCALE_OPTIONS: Array<{ value: Locale; shortLabel: string; labelKey: string }> = [
  { value: 'zh-CN', shortLabel: '简', labelKey: 'locale.zh-CN' },
  { value: 'zh-Hant', shortLabel: '繁', labelKey: 'locale.zh-Hant' },
  { value: 'en', shortLabel: 'EN', labelKey: 'locale.en' },
]

// Shared input style reused by <input> and <textarea>
const inputCls =
  'w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-[11px] text-sm text-gray-900 bg-white outline-none box-border transition-all focus:border-violet-600 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]'

export function FeedbackPage() {
  const { locale, setLocale, t } = useI18n()
  const [feedbackType, setFeedbackType] = useState<FeedbackTypeId>('bug')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [contact, setContact] = useState('')
  const [allowContact, setAllowContact] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLocalePickerOpen, setIsLocalePickerOpen] = useState(false)

  function buildApiUrl(path: string): string {
    if (/^https?:\/\//.test(path)) return path
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    if (!API_BASE_URL) return normalizedPath
    const base = API_BASE_URL.replace(/\/$/, '')
    return `${base}${normalizedPath}`
  }

  async function getSignedUploadUrl(file: File): Promise<SignedUploadResponse> {
    const response = await fetch(buildApiUrl(SIGNED_UPLOAD_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.status}`)
    }

    return (await response.json()) as SignedUploadResponse
  }

  async function uploadFileToCloudStorage(
    file: File,
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<AttachmentPayload> {
    const signed = await getSignedUploadUrl(file)

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', signed.uploadUrl, true)
      xhr.timeout = 10 * 60 * 1000

      const headers = {
        'Content-Type': file.type || 'application/octet-stream',
        ...(signed.requiredHeaders ?? {}),
      }

      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value)
      }

      xhr.upload.onprogress = event => {
        if (!event.lengthComputable) return
        onProgress?.(event.loaded, event.total)
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(file.size, file.size)
          resolve()
          return
        }
        reject(new Error(`Upload failed: ${xhr.status}`))
      }

      xhr.onerror = () => reject(new Error('Upload failed: network error'))
      xhr.ontimeout = () => reject(new Error('Upload failed: timeout'))
      xhr.send(file)
    })

    return {
      url: signed.fileUrl,
      filename: file.name,
      size: file.size,
    }
  }

  async function handleSubmit() {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setUploadProgress(0)
    try {
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
      let uploadedBytesBeforeCurrent = 0
      const attachments: AttachmentPayload[] = []

      for (const file of files) {
        const attachment = await uploadFileToCloudStorage(file, (loaded, total) => {
          if (totalBytes === 0) return
          const currentFileLoaded = Math.min(loaded, total)
          const overall = Math.round(((uploadedBytesBeforeCurrent + currentFileLoaded) / totalBytes) * 100)
          setUploadProgress(Math.max(0, Math.min(100, overall)))
        })

        attachments.push(attachment)
        uploadedBytesBeforeCurrent += file.size
        if (totalBytes > 0) {
          const overall = Math.round((uploadedBytesBeforeCurrent / totalBytes) * 100)
          setUploadProgress(Math.max(0, Math.min(100, overall)))
        }
      }

      const submitResponse = await fetch(buildApiUrl(FEEDBACK_SUBMIT_PATH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: JSON.stringify({
          type: feedbackType,
          content: content.trim(),
          rating,
          contact,
          allowContact,
          locale,
          attachments,
        }),
      })

      if (!submitResponse.ok) {
        throw new Error(`Submit failed: ${submitResponse.status}`)
      }

      setUploadProgress(100)
      setSubmitted(true)
      setFiles([])
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error('Submit feedback failed:', error)
    } finally {
      setUploadProgress(0)
      setIsSubmitting(false)
    }
  }

  function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale)
    setIsLocalePickerOpen(false)
  }

  const currentLocaleOption = LOCALE_OPTIONS.find(item => item.value === locale) ?? LOCALE_OPTIONS[0]

  const contactChannels = [
    { label: t('channel.email.label'), value: t('channel.email.value') },
    { label: t('channel.time.label'), value: t('channel.time.value') },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      {/* Gradient header: nav + hero blended */}
      <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] px-4 pb-5">
        <NavBar
          title={t('nav.title')}
          left={
            <button
              type="button"
              onClick={() => history.back()}
              aria-label={t('nav.back')}
              className="text-white text-2xl leading-none opacity-90 cursor-pointer border-0 bg-transparent p-0"
            >
              ‹
            </button>
          }
          right={
            <button
              type="button"
              onClick={() => setIsLocalePickerOpen(true)}
              aria-label={t('nav.switchLanguage')}
              className="text-white text-sm opacity-90 cursor-pointer border-0 bg-transparent p-0"
            >
              {currentLocaleOption.shortLabel}
            </button>
          }
        />
        <div className="mt-3">
          <h1 className="text-xl font-bold text-white m-0 mb-1.5">{t('hero.title')}</h1>
          <p className="text-[13px] leading-relaxed text-white/90 m-0">
            {t('hero.description')}
          </p>
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
          <label className="text-[13px] font-semibold text-gray-700 block mb-2">
            {t('detail.label')}
          </label>
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

        <Card>
          <SectionHeader icon="@" title={t('section.contact')} />
          <label className="text-[13px] font-semibold text-gray-700 block mb-2">{t('contact.inputLabel')}</label>
          <input
            type="text"
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder={t('contact.placeholder')}
            className={inputCls}
          />
          <div className="flex gap-2 items-start mt-2.5">
            <input
              id="allow-contact"
              type="checkbox"
              checked={allowContact}
              onChange={e => setAllowContact(e.target.checked)}
              className="mt-0.5 accent-violet-600 shrink-0"
            />
            <label htmlFor="allow-contact" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
              {t('contact.allow')}
            </label>
          </div>
        </Card>

        <Card>
          <SectionHeader icon="🎧" title={t('section.otherChannels')} />
          <div className="grid grid-cols-2 gap-2.5">
            {contactChannels.map(ch => (
              <div key={ch.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 m-0 mb-1">{ch.label}</p>
                <p className="text-[13px] font-semibold text-gray-900 m-0 break-words">{ch.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-2.5 pb-[18px] bg-gradient-to-t from-[#f5f5f7] via-[rgba(245,245,247,0.9)] to-transparent pointer-events-none">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="pointer-events-auto w-full border-0 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-[15px] font-bold py-[13px] cursor-pointer shadow-[0_8px_20px_rgba(102,126,234,0.3)] active:scale-[0.99] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
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

      {isLocalePickerOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label={t('nav.languagePickerCancel')}
            onClick={() => setIsLocalePickerOpen(false)}
            className="absolute inset-0 border-0 bg-black/30"
          />
          <div className="absolute top-14 right-4 w-[210px] rounded-xl bg-white border border-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.18)] p-2.5">
            <p className="m-0 mb-2 px-1 text-xs font-semibold text-gray-500">{t('nav.languagePickerTitle')}</p>
            <div className="grid gap-1.5">
              {LOCALE_OPTIONS.map(item => {
                const active = item.value === locale
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => selectLocale(item.value)}
                    className={[
                      'w-full rounded-lg border px-2.5 py-2 text-left text-sm cursor-pointer transition-colors flex items-center justify-between',
                      active
                        ? 'border-violet-300 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-violet-200 hover:bg-violet-50/40',
                    ].join(' ')}
                  >
                    <span>{t(item.labelKey)}</span>
                    <span className={active ? 'text-violet-600' : 'text-gray-300'}>{active ? '✓' : '○'}</span>
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setIsLocalePickerOpen(false)}
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
            >
              {t('nav.languagePickerCancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
