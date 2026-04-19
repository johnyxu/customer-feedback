/**
 * API 路由常量
 */

// Storage API 路由
export const SIGNED_UPLOAD_PATH = '/api/storage/signed-upload-url'

// Email 验证反馈流程
export const FEEDBACK_EMAIL_SEND_CODE_PATH = '/api/email/send-code'
// 新增：仅验证 code，服务端返回 sessionToken（需后端配合添加此接口）
export const FEEDBACK_EMAIL_VERIFY_CODE_PATH = '/api/email/verify'
export const FEEDBACK_EMAIL_SUBMIT_PATH = '/api/feedback'

// Token 认证后的通用提交（对应 POST /api/feedback，由 Bearer token 标识身份）
export const FEEDBACK_SUBMIT_PATH = '/api/feedback'

// 匿名反馈流程
export const FEEDBACK_ANONYMOUS_SUBMIT_PATH = '/api/feedback/anonymous/submit'
export const FEEDBACK_ANONYMOUS_BIND_EMAIL_PATH = '/api/feedback/anonymous/bind-email'

// 反馈列表
export const FEEDBACK_LIST_PATH = '/api/feedback'

// 动态路由（含 feedbackId）
export const feedbackThreadPath = (feedbackId: string) => `/api/feedback/${feedbackId}/thread`
export const feedbackFollowUpPath = (feedbackId: string) => `/api/feedback/${feedbackId}/follow-up`

// 认证流程
export const AUTH_LOGIN_PATH = '/api/auth/login'
export const AUTH_REGISTER_PATH = '/api/auth/register'
export const AUTH_GOOGLE_PATH = '/api/auth/google'
export const AUTH_FORGOT_PASSWORD_PATH = '/api/auth/forgot-password'
export const AUTH_RESET_PASSWORD_PATH = '/api/auth/reset-password'
