/**
 * Feedback API service.
 * Centralizes feedback API calls and domain types.
 *
 * Auth storage -> src/api/auth.ts
 * File upload  -> src/api/uploadService.ts
 * HTTP utils   -> src/api/client.ts
 */

import {
  FEEDBACK_EMAIL_SEND_CODE_PATH,
  FEEDBACK_EMAIL_VERIFY_CODE_PATH,
  FEEDBACK_EMAIL_SUBMIT_PATH,
  FEEDBACK_SUBMIT_PATH,
  FEEDBACK_ANONYMOUS_SUBMIT_PATH,
  FEEDBACK_ANONYMOUS_BIND_EMAIL_PATH,
  FEEDBACK_LIST_PATH,
  feedbackThreadPath,
  feedbackFollowUpPath,
} from '../constants/routes'
import { messages, type Locale } from '../i18n/messages'
import { I18N_KEYS, type I18nKey } from '../i18n/keys'
import { buildApiUrl, buildHeaders } from './client'
import { setAuthData, type AuthData } from './auth'
import type { AttachmentPayload } from './uploadService'

export type { AuthData, AuthIdentity } from './auth'
export type { AttachmentPayload } from './uploadService'
export { getAuthData, getSessionToken, clearSessionToken } from './auth'
export { uploadFiles, uploadFileToCloudStorage } from './uploadService'

// ============================================================
// Domain types
// ============================================================

export type FeedbackStatus = 'new' | 'reviewed' | 'replied' | 'resolved'

export type FeedbackSubmitData = {
  type: string
  content: string
  rating: number
  locale: string
  attachments: AttachmentPayload[]
}

export type FeedbackListFirstMessage = {
  id: string
  feedbackId: string
  sender: 'customer' | 'admin'
  senderId: string
  content: string
  isQuestion: boolean
  inReplyToMessageId: string | null
  createdAt: string
}

export type FeedbackListItem = {
  id: string
  type: string
  rating: number
  contact: string | null
  allowContact: boolean
  status: FeedbackStatus
  locale: string
  submitMode: string
  identityId: string
  firstCustomerMessageId: string | null
  latestAdminReply: FeedbackListFirstMessage | null
  createdAt: string
  updatedAt: string
  firstCustomerMessage: FeedbackListFirstMessage | null
  tagMaps: unknown[]
}

export type FeedbackAttachment = {
  id: string
  feedbackId: string
  messageId: string
  url: string
  filename: string
  sizeBytes: number
  createdAt: string
}

export type FeedbackMessage = {
  id: string
  feedbackId: string
  sender: 'customer' | 'admin'
  senderId: string
  content: string
  isQuestion: boolean
  inReplyToMessageId: string | null
  createdAt: string
  attachments: FeedbackAttachment[]
}

export type FeedbackIdentity = {
  id: string
  mode: string
  anonymousId: string
  email: string | null
  emailVerifiedAt: string | null
  isEmailBound: boolean
  createdAt: string
  updatedAt: string
}

export type FeedbackThread = {
  id: string
  type: string
  rating: number
  contact: string | null
  allowContact: boolean
  status: FeedbackStatus
  locale: string
  submitMode: string
  identityId: string
  firstCustomerMessageId: string | null
  latestAdminReply: FeedbackMessage | null
  createdAt: string
  updatedAt: string
  identity: FeedbackIdentity
  messages: FeedbackMessage[]
  tagMaps: unknown[]
}

// ============================================================
// UI display mappings
// ============================================================

const FEEDBACK_TYPE_KEY: Record<string, I18nKey> = {
  bug: I18N_KEYS.FEEDBACK_TYPE_BUG,
  feature: I18N_KEYS.FEEDBACK_TYPE_FEATURE,
  experience: I18N_KEYS.FEEDBACK_TYPE_EXPERIENCE_ISSUE,
  other: I18N_KEYS.FEEDBACK_TYPE_OTHER,
}

export function feedbackTypeLabel(type: string, locale: Locale): string {
  const key = FEEDBACK_TYPE_KEY[type]
  if (!key) return type
  return messages[locale][key]
}

export function statusChip(status: FeedbackStatus, locale: Locale): { label: string; className: string } {
  if (status === 'new')
    return { label: messages[locale][I18N_KEYS.FEEDBACK_STATUS_NEW], className: 'bg-blue-50 text-blue-600' }
  if (status === 'reviewed') {
    return { label: messages[locale][I18N_KEYS.FEEDBACK_STATUS_REVIEWED], className: 'bg-amber-50 text-amber-700' }
  }
  if (status === 'replied') {
    return { label: messages[locale][I18N_KEYS.FEEDBACK_STATUS_REPLIED], className: 'bg-emerald-50 text-emerald-700' }
  }
  return { label: messages[locale][I18N_KEYS.FEEDBACK_STATUS_RESOLVED], className: 'bg-slate-100 text-slate-600' }
}

// ============================================================
// Email verification flow
// ============================================================

export async function sendEmailVerificationCode(email: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(buildApiUrl(FEEDBACK_EMAIL_SEND_CODE_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email }),
  })
  if (!response.ok) throw new Error(`Failed to send verification code: ${response.status}`)
  return response.json()
}

export async function verifyEmailCode(email: string, code: string): Promise<AuthData> {
  const response = await fetch(buildApiUrl(FEEDBACK_EMAIL_VERIFY_CODE_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, code }),
  })
  if (!response.ok) throw new Error(`Verification failed: ${response.status}`)
  const data = (await response.json()) as AuthData
  setAuthData(data)
  return data
}

export async function submitFeedback(
  feedbackData: FeedbackSubmitData,
): Promise<{ success: boolean; id?: string; message?: string }> {
  const response = await fetch(buildApiUrl(FEEDBACK_SUBMIT_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(feedbackData),
  })
  if (!response.ok) throw new Error(`Submit failed: ${response.status}`)
  return response.json()
}

export async function submitEmailFeedback(
  email: string,
  code: string,
  feedbackData: FeedbackSubmitData,
): Promise<{ success: boolean; id?: string; message?: string }> {
  const response = await fetch(buildApiUrl(FEEDBACK_EMAIL_SUBMIT_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, code, ...feedbackData }),
  })
  if (!response.ok) throw new Error(`Submit failed: ${response.status}`)
  return response.json()
}

// ============================================================
// Anonymous feedback flow
// ============================================================

export async function submitAnonymousFeedback(
  feedbackData: FeedbackSubmitData,
): Promise<{ success: boolean; id?: string; anonymousToken?: string; message?: string }> {
  const response = await fetch(buildApiUrl(FEEDBACK_ANONYMOUS_SUBMIT_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(feedbackData),
  })
  if (!response.ok) throw new Error(`Submit failed: ${response.status}`)
  return response.json()
}

export async function bindAnonymousEmail(
  anonymousToken: string,
  email: string,
  code: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(buildApiUrl(FEEDBACK_ANONYMOUS_BIND_EMAIL_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ anonymousToken, email, code }),
  })
  if (!response.ok) throw new Error(`Bind email failed: ${response.status}`)
  return response.json()
}

// ============================================================
// Feedback list and thread
// ============================================================

export async function listFeedback(): Promise<FeedbackListItem[]> {
  const response = await fetch(buildApiUrl(FEEDBACK_LIST_PATH), {
    method: 'GET',
    headers: buildHeaders(),
  })
  if (!response.ok) throw new Error(`List feedback failed: ${response.status}`)
  const body = await response.json()
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.feedbacks)) return body.feedbacks
  if (Array.isArray(body?.items)) return body.items
  return []
}

export async function getFeedbackThread(feedbackId: string): Promise<FeedbackThread> {
  const response = await fetch(buildApiUrl(feedbackThreadPath(feedbackId)), {
    method: 'GET',
    headers: buildHeaders(),
  })
  if (!response.ok) throw new Error(`Get thread failed: ${response.status}`)
  return response.json()
}

export async function submitFollowUp(
  feedbackId: string,
  content: string,
  attachments: AttachmentPayload[] = [],
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(buildApiUrl(feedbackFollowUpPath(feedbackId)), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ content, attachments }),
  })
  if (!response.ok) throw new Error(`Follow-up failed: ${response.status}`)
  return response.json()
}
