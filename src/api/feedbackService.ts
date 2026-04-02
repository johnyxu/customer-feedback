/**
 * Feedback 相关的 API 服务
 * 统一管理所有反馈 API 调用和领域类型
 *
 * Auth 存储 → src/api/auth.ts
 * 文件上传  → src/api/uploadService.ts
 * HTTP 工具 → src/api/client.ts
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
// UI 展示映射（集中管理，避免各页面重复定义）
// ============================================================

export const FEEDBACK_TYPE_LABEL: Record<string, string> = {
  bug: '问题反馈',
  feature: '功能建议',
  experience: '体验问题',
  other: '其他',
}

export function statusChip(status: FeedbackStatus): { label: string; className: string } {
  if (status === 'new') return { label: '待处理', className: 'bg-blue-50 text-blue-600' }
  if (status === 'reviewed') return { label: '处理中', className: 'bg-amber-50 text-amber-700' }
  if (status === 'replied') return { label: '管理员已回复', className: 'bg-emerald-50 text-emerald-700' }
  return { label: '已解决', className: 'bg-slate-100 text-slate-600' }
}

// ============================================================
// Email 验证反馈流程
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
// 匿名反馈流程
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
// 反馈列表 & 会话线程
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

