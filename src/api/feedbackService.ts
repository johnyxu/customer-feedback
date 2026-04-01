/**
 * Feedback 相关的 API 服务
 * 统一管理所有 API 调用
 */

import { API_BASE_URL, API_KEY } from '../constants/env'
import {
  SIGNED_UPLOAD_PATH,
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

// ============================================================
// Auth storage（localStorage，持久化跨 Tab，含过期检查）
// ============================================================

const FEEDBACK_AUTH_KEY = 'fb_auth'

export type AuthIdentity = {
  id: string
  anonymousId: string
  email: string
}

export type AuthData = {
  token: string
  expiresAt: string
  identity: AuthIdentity
}

export function getAuthData(): AuthData | null {
  const raw = localStorage.getItem(FEEDBACK_AUTH_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as AuthData
    if (new Date(data.expiresAt) <= new Date()) {
      localStorage.removeItem(FEEDBACK_AUTH_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

/** 返回当前有效的 Bearer token，已过期或未登录时返回 null */
export function getSessionToken(): string | null {
  return getAuthData()?.token ?? null
}

function setAuthData(data: AuthData): void {
  localStorage.setItem(FEEDBACK_AUTH_KEY, JSON.stringify(data))
}

export function clearSessionToken(): void {
  localStorage.removeItem(FEEDBACK_AUTH_KEY)
}

// ============================================================
// Shared types
// ============================================================

export type AttachmentPayload = {
  url: string
  filename: string
  size: number
}

export type FeedbackStatus = 'replied' | 'processing' | 'resolved'

export type FeedbackSubmitData = {
  type: string
  content: string
  rating: number
  locale: string
  attachments: AttachmentPayload[]
}

export type FeedbackListItem = {
  id: string
  title: string
  summary?: string
  status: FeedbackStatus
  updatedAt: string
  messageCount: number
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

/** FeedbackSummary: shape used in list items (kept for FeedbackListPage) */
export type FeedbackSummary = {
  id: string
  status: FeedbackStatus
}

/** FeedbackThread: full feedback object returned by GET /api/feedback/:id/thread */
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

/**
 * 构建完整的 API URL
 */
function buildApiUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!API_BASE_URL) return normalizedPath
  const base = API_BASE_URL.replace(/\/$/, '')
  return `${base}${normalizedPath}`
}

/**
 * 构建请求头
 */
function buildHeaders(contentType = 'application/json'): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
  }
  if (API_KEY) {
    headers['x-api-key'] = API_KEY
  }
  const token = getSessionToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// ============================================================
// Email 验证反馈流程
// ============================================================

/**
 * 第一步：请求发送邮箱验证码
 * POST /api/email/send-code
 */
export async function sendEmailVerificationCode(email: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(buildApiUrl(FEEDBACK_EMAIL_SEND_CODE_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email }),
  })
  if (!response.ok) throw new Error(`Failed to send verification code: ${response.status}`)
  return response.json()
}

/**
 * 第二步（新）：仅验证 code，服务端颁发 sessionToken
 * POST /api/feedback/email/verify-code
 *
 * ⚠️  需要后端新增此接口，返回 { sessionToken: string }
 * 验证通过后 token 存入 sessionStorage，后续请求自动携带。
 */
export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<AuthData> {
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

/**
 * Token 认证后提交反馈（token 由 buildHeaders 自动注入）
 * POST /api/feedback
 */
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

/**
 * 兼容旧路径：验证码 + 反馈内容一起提交（不需要单独 verify 步骤）
 * POST /api/feedback/email/submit
 */
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

/**
 * 提交匿名反馈
 * POST /api/feedback/anonymous/submit
 */
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

/**
 * 匿名用户事后绑定邮箱，以便接收进展通知
 * POST /api/feedback/anonymous/bind-email
 */
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

/**
 * 获取反馈列表
 * GET /api/feedback
 */
export async function listFeedback(): Promise<FeedbackListItem[]> {
  const response = await fetch(buildApiUrl(FEEDBACK_LIST_PATH), {
    method: 'GET',
    headers: buildHeaders(),
  })
  if (!response.ok) throw new Error(`List feedback failed: ${response.status}`)
  const body = await response.json()
  // 兼容后端返回 [...] / { data: [...] } / { feedbacks: [...] } / { items: [...] }
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.feedbacks)) return body.feedbacks
  if (Array.isArray(body?.items)) return body.items
  return []
}

/**
 * 获取某条反馈的完整会话线程
 * GET /api/feedback/:feedbackId/thread
 */
export async function getFeedbackThread(feedbackId: string): Promise<FeedbackThread> {
  const response = await fetch(buildApiUrl(feedbackThreadPath(feedbackId)), {
    method: 'GET',
    headers: buildHeaders(),
  })
  if (!response.ok) throw new Error(`Get thread failed: ${response.status}`)
  return response.json()
}

/**
 * 客户跟进回复
 * POST /api/feedback/:feedbackId/follow-up
 */
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

// ============================================================
// 文件上传
// ============================================================

/**
 * 获取 Cloud Storage 签名上传 URL
 * POST /api/storage/signed-upload-url
 */
export async function getSignedUploadUrl(
  filename: string,
  contentType: string,
  size: number,
): Promise<{ uploadUrl: string; fileUrl: string; requiredHeaders?: Record<string, string> }> {
  const response = await fetch(buildApiUrl(SIGNED_UPLOAD_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      filename,
      contentType: contentType || 'application/octet-stream',
      size,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get signed url: ${response.status}`)
  }

  return response.json()
}

/** 上传单个文件到 Cloud Storage（通过签名 URL）*/
export async function uploadFileToCloudStorage(
  file: File,
  onProgress?: (loaded: number, total: number) => void,
): Promise<AttachmentPayload> {
  const signed = await getSignedUploadUrl(file.name, file.type, file.size)

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

/** 批量上传文件，onProgress 回调提供整体进度 */
export async function uploadFiles(
  files: File[],
  onProgress?: (currentFileIndex: number, loaded: number, total: number) => void,
): Promise<AttachmentPayload[]> {
  const attachments: AttachmentPayload[] = []
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  let uploadedBytesBeforeCurrent = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const attachment = await uploadFileToCloudStorage(file, (loaded, total) => {
      if (totalBytes === 0) return
      const currentFileLoaded = Math.min(loaded, total)
      const overall = uploadedBytesBeforeCurrent + currentFileLoaded
      onProgress?.(i, overall, totalBytes)
    })

    attachments.push(attachment)
    uploadedBytesBeforeCurrent += file.size
  }

  return attachments
}
