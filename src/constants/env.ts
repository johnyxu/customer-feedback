/**
 * 环境配置常数
 * 从 import.meta.env 读取配置，统一管理所有环境变量
 */

// Cloud Run base URL
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

// API key (public to browser, do NOT put secret credentials here)
export const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

// Google OAuth client ID
export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()
