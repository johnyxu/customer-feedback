import { useState } from 'react'
import { submitFollowUp, getFeedbackThread } from '@api/feedbackService'
import { uploadFiles, type AttachmentPayload } from '@api/uploadService'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'
import type { FeedbackThread } from '@/types/api-contracts'
import { UploadBox } from './UploadBox'

type Props = {
  feedbackId: string
  onSuccess: (updated: FeedbackThread) => void
}

export function FollowUpBox({ feedbackId, onSuccess }: Props) {
  const { t } = useI18n()
  const [replyText, setReplyText] = useState('')
  const [replyFiles, setReplyFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  async function handleSubmit() {
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
      setReplyText('')
      setReplyFiles([])
      setUploadProgress(0)
      onSuccess(updated)
    } catch {
      setSubmitError(t(I18N_KEYS.FOLLOWUP_SEND_FAILED))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-semibold text-slate-500">{t(I18N_KEYS.FOLLOWUP_TITLE)}</p>
      {submitError && <p className="mb-1 text-xs text-red-500">{submitError}</p>}
      <textarea
        rows={2}
        value={replyText}
        onChange={e => setReplyText(e.target.value)}
        placeholder={t(I18N_KEYS.FOLLOWUP_PLACEHOLDER)}
        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
        }}
      />
      <div className="mt-2">
        <UploadBox files={replyFiles} onFilesChange={setReplyFiles} />
      </div>
      {submitting && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {t(I18N_KEYS.FOLLOWUP_UPLOADING)} {uploadProgress}%
          </p>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">{t(I18N_KEYS.FOLLOWUP_SHORTCUT)}</p>
        <button
          type="button"
          disabled={!replyText.trim() || submitting}
          onClick={handleSubmit}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-40"
        >
          {submitting ? t(I18N_KEYS.FOLLOWUP_SENDING) : t(I18N_KEYS.FOLLOWUP_SEND)}
        </button>
      </div>
    </section>
  )
}
