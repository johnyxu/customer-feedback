/**
 * API Contracts - Request & Response Type Definitions
 *
 * This file extracts and consolidates all specific request/response types from auto-generated API contracts.
 * Provides direct access to typed request bodies and response payloads for each endpoint.
 *
 * DO NOT modify this file directly. It re-exports types from auto-generated sources.
 */

import type { paths as EmailPathsType } from './api.email.generated'
import type { paths as FeedbackPathsType } from './api.feedback.generated'
import type { paths as SystemPathsType } from './api.system.generated'

// ============================================================================
// EMAIL API - Request & Response Type Definitions
// ============================================================================

/** POST /api/email/send-code - Send verification code to email */
export type EmailSendCodeRequest =
  EmailPathsType['/api/email/send-code']['post']['requestBody']['content']['application/json']
export type EmailSendCodeResponse =
  EmailPathsType['/api/email/send-code']['post']['responses']['201']['content']['application/json']

/** POST /api/email/verify - Verify email code and get auth token */
export type EmailVerifyRequest =
  EmailPathsType['/api/email/verify']['post']['requestBody']['content']['application/json']
export type EmailVerifyResponse =
  EmailPathsType['/api/email/verify']['post']['responses']['200']['content']['application/json']

// ============================================================================
// FEEDBACK API - Request & Response Type Definitions
// ============================================================================

/** POST /api/feedback/anonymous/submit - Submit anonymous feedback */
export type FeedbackAnonymousSubmitRequest =
  FeedbackPathsType['/api/feedback/anonymous/submit']['post']['requestBody']['content']['application/json']
export type FeedbackAnonymousSubmitResponse =
  FeedbackPathsType['/api/feedback/anonymous/submit']['post']['responses']['201']['content']['application/json']

/** POST /api/feedback/anonymous/bind-email - Bind email to anonymous feedback */
export type FeedbackBindEmailRequest =
  FeedbackPathsType['/api/feedback/anonymous/bind-email']['post']['requestBody']['content']['application/json']
export type FeedbackBindEmailResponse =
  FeedbackPathsType['/api/feedback/anonymous/bind-email']['post']['responses']['200']['content']['application/json']

/** POST /api/feedback/{feedbackId}/admin-reply - Add admin reply to feedback thread */
export type FeedbackAdminReplyRequest =
  FeedbackPathsType['/api/feedback/{feedbackId}/admin-reply']['post']['requestBody']['content']['application/json']
export type FeedbackAdminReplyResponse =
  FeedbackPathsType['/api/feedback/{feedbackId}/admin-reply']['post']['responses']['201']['content']['application/json']

/** GET /api/feedback/{feedbackId} - Get feedback detail (admin only) */
export type FeedbackDetailResponse =
  FeedbackPathsType['/api/feedback/{feedbackId}']['get']['responses']['200']['content']['application/json']

/** PATCH /api/feedback/{feedbackId}/status - Update feedback status */
export type FeedbackUpdateStatusRequest =
  FeedbackPathsType['/api/feedback/{feedbackId}/status']['patch']['requestBody']['content']['application/json']
export type FeedbackUpdateStatusResponse =
  FeedbackPathsType['/api/feedback/{feedbackId}/status']['patch']['responses']['200']['content']['application/json']

/** PATCH /api/feedback/{feedbackId}/tags - Update feedback tags */
export type FeedbackUpdateTagsRequest =
  FeedbackPathsType['/api/feedback/{feedbackId}/tags']['patch']['requestBody']['content']['application/json']
export type FeedbackUpdateTagsResponse =
  FeedbackPathsType['/api/feedback/{feedbackId}/tags']['patch']['responses']['200']['content']['application/json']

/** POST /api/feedback/{feedbackId}/mark-as-duplicate - Mark feedback as duplicate */
export type FeedbackMarkDuplicateRequest =
  FeedbackPathsType['/api/feedback/{feedbackId}/mark-as-duplicate']['post']['requestBody']['content']['application/json']
export type FeedbackMarkDuplicateResponse =
  FeedbackPathsType['/api/feedback/{feedbackId}/mark-as-duplicate']['post']['responses']['201']['content']['application/json']

/** GET /api/feedback - List feedback with filters and pagination */
export type FeedbackListResponse =
  FeedbackPathsType['/api/feedback']['get']['responses']['200']['content']['application/json']

/** POST /api/feedback - Submit feedback with authentication token */
export type FeedbackSubmitRequest =
  FeedbackPathsType['/api/feedback']['post']['requestBody']['content']['application/json']
export type FeedbackSubmitResponse =
  FeedbackPathsType['/api/feedback']['post']['responses']['201']['content']['application/json']

/** POST /api/feedback/{feedbackId}/follow-up - Add customer follow-up message */
export type FeedbackFollowUpRequest =
  FeedbackPathsType['/api/feedback/{feedbackId}/follow-up']['post']['requestBody']['content']['application/json']
export type FeedbackFollowUpResponse =
  FeedbackPathsType['/api/feedback/{feedbackId}/follow-up']['post']['responses']['201']['content']['application/json']

/** GET /api/feedback/{feedbackId}/thread - Get feedback thread conversation */
export type FeedbackThreadResponse =
  FeedbackPathsType['/api/feedback/{feedbackId}/thread']['get']['responses']['200']['content']['application/json']

// ============================================================================
// SYSTEM API - Request & Response Type Definitions
// ============================================================================

/** POST /api/storage/signed-upload-url - Generate signed upload URL for GCS */
export type StorageSignedUploadUrlRequest =
  SystemPathsType['/api/storage/signed-upload-url']['post']['requestBody']['content']['application/json']
export type StorageSignedUploadUrlResponse =
  SystemPathsType['/api/storage/signed-upload-url']['post']['responses']['200']['content']['application/json']

// ============================================================================
// HELPER TYPES - Extracted from responses
// ============================================================================

/** Feedback status enum */
export type FeedbackStatus = 'new' | 'reviewed' | 'replied' | 'resolved'

/** Feedback type enum */
export type FeedbackType = 'bug' | 'feature' | 'experience' | 'other'

/** Locale enum */
export type LocaleType = 'zh-CN' | 'zh-Hant' | 'en'

/** Extract attachment type from feedback responses */
export type FeedbackAttachment = NonNullable<
  NonNullable<FeedbackThreadResponse['data']>['messages']
>[number]['attachments'][number]

/** Extract identity type from feedback responses */
export type FeedbackIdentity = NonNullable<NonNullable<FeedbackThreadResponse['data']>['identity']>

/** Extract message type from feedback thread response */
export type FeedbackMessage = NonNullable<NonNullable<FeedbackThreadResponse['data']>['messages']>[number]

/** Extract feedback item from list response */
export type FeedbackListItem = NonNullable<NonNullable<FeedbackListResponse['data']>['items']>[number]

/** Extract single feedback thread */
export type FeedbackThread = NonNullable<FeedbackThreadResponse['data']>

/** Request body for submitting feedback */
export type FeedbackSubmitData = FeedbackSubmitRequest & {
  attachments?: Array<{ url: string; filename: string; size: number }>
}

// ============================================================================
// Namespace Exports (for grouped access by module)
// ============================================================================
export * as Email from './api.email.generated'
export * as Feedback from './api.feedback.generated'
export * as System from './api.system.generated'
