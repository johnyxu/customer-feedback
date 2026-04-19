import { buildApiUrl, buildHeaders } from './client'
import {
  AUTH_LOGIN_PATH,
  AUTH_REGISTER_PATH,
  AUTH_GOOGLE_PATH,
  AUTH_FORGOT_PASSWORD_PATH,
  AUTH_RESET_PASSWORD_PATH,
} from '@constants/routes'

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

export function setAuthData(data: AuthData): void {
  localStorage.setItem(FEEDBACK_AUTH_KEY, JSON.stringify(data))
}

export function clearSessionToken(): void {
  localStorage.removeItem(FEEDBACK_AUTH_KEY)
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

async function parseAuthResponse(res: Response): Promise<AuthData> {
  const body = await res.json()
  if (!res.ok) {
    throw new Error(body?.message ?? `Request failed (${res.status})`)
  }
  const data = body?.data as AuthData
  setAuthData(data)
  return data
}

export async function loginWithPassword(email: string, password: string): Promise<AuthData> {
  const res = await fetch(buildApiUrl(AUTH_LOGIN_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  })
  return parseAuthResponse(res)
}

export async function registerWithPassword(email: string, password: string): Promise<AuthData> {
  const res = await fetch(buildApiUrl(AUTH_REGISTER_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  })
  return parseAuthResponse(res)
}

export async function loginWithGoogle(idToken: string, anonymousId?: string): Promise<AuthData> {
  const res = await fetch(buildApiUrl(AUTH_GOOGLE_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ idToken, ...(anonymousId ? { anonymousId } : {}) }),
  })
  return parseAuthResponse(res)
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(buildApiUrl(AUTH_FORGOT_PASSWORD_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? `Request failed (${res.status})`)
  }
}

export async function resetPassword(email: string, token: string, newPassword: string): Promise<void> {
  const res = await fetch(buildApiUrl(AUTH_RESET_PASSWORD_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, token, newPassword }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? `Request failed (${res.status})`)
  }
}
