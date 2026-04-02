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
