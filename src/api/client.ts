import { API_BASE_URL, API_KEY } from '../constants/env'
import { getSessionToken } from './auth'

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!API_BASE_URL) return normalizedPath
  const base = API_BASE_URL.replace(/\/$/, '')
  return `${base}${normalizedPath}`
}

export function buildHeaders(contentType = 'application/json'): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': contentType }
  if (API_KEY) headers['x-api-key'] = API_KEY
  const token = getSessionToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}
