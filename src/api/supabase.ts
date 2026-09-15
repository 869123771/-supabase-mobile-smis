import type { Session } from './types'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'
interface RequestOptions { method?: HttpMethod; body?: unknown; token?: string; headers?: Record<string, string> }

const TECHNICAL_ERROR = /schema cache|postgrest|pgrst\d+|sqlstate|duplicate key|violates .* constraint|does not exist/i

export class ApiRequestError extends Error {
  technicalMessage: string
  constructor(value: unknown, fallback = '请求失败，请稍后重试') {
    const source = value as Record<string, unknown> | null
    const raw = typeof value === 'string' ? value : String(source?.message || source?.msg || source?.error || source?.details || '')
    let message = TECHNICAL_ERROR.test(raw) ? fallback : raw || fallback
    if (/invalid login credentials|invalid email or password/i.test(raw)) message = '账号或密码错误'
    if (/jwt expired|invalid jwt/i.test(raw)) message = '登录已过期，请重新登录'
    if (/permission denied|row-level security|unauthorized/i.test(raw)) message = '暂无权限执行此操作'
    if (/failed to fetch|request:fail|network error/i.test(raw)) message = '网络连接异常，请检查网络后重试'
    super(message)
    this.name = 'ApiRequestError'
    this.technicalMessage = raw
  }
}

export function getErrorMessage(error: unknown, fallback = '请求失败，请稍后重试') {
  return error instanceof Error ? error.message || fallback : fallback
}

function trimSlash(value: string) { return value.replace(/\/$/, '') }
function toCamelKey(value: string) { return value.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase()) }
function toSnakeKey(value: string) { return value.replace(/([A-Z])/g, '_$1').replace(/^_/, '').toLowerCase() }

export function keysToCamel<T>(input: unknown): T {
  if (Array.isArray(input)) return input.map(keysToCamel) as T
  if (!input || typeof input !== 'object' || input.constructor !== Object) return input as T
  return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([k, v]) => [toCamelKey(k), keysToCamel(v)])) as T
}

export function keysToSnake<T>(input: unknown): T {
  if (Array.isArray(input)) return input.map(keysToSnake) as T
  if (!input || typeof input !== 'object' || input.constructor !== Object) return input as T
  return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([k, v]) => [toSnakeKey(k), keysToSnake(v)])) as T
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new ApiRequestError('', '请先配置 Supabase 环境变量')
  const url = path.startsWith('http') ? path : `${trimSlash(SUPABASE_URL)}${path}`
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: (options.method || 'GET') as UniApp.RequestOptions['method'],
      header: { apikey: SUPABASE_KEY, Authorization: `Bearer ${options.token || SUPABASE_KEY}`, 'Content-Type': 'application/json', ...options.headers },
      data: options.body as UniApp.RequestOptions['data'],
      success(response) {
        if ((response.statusCode || 0) >= 200 && (response.statusCode || 0) < 300) resolve(response.data as T)
        else reject(new ApiRequestError(response.data))
      },
      fail(error) { reject(new ApiRequestError(error.errMsg, '网络请求失败')) }
    })
  })
}

export async function passwordLogin(account: string, password: string) {
  const identifier = account.trim()
  if (identifier.includes('@')) {
    await request('/functions/v1/check_user_status', { method: 'POST', body: { email: identifier.toLowerCase() } })
    return request<Session>('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: identifier.toLowerCase(), password } })
  }
  const payload = await request<{ session?: Session } | Session>('/functions/v1/login-with-phone', { method: 'POST', body: { phone: identifier, password } })
  return ('session' in payload && payload.session ? payload.session : payload) as Session
}

export function refreshToken(value: string) {
  return request<Session>('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: value } })
}

export async function signOut(token: string) { await request('/auth/v1/logout', { method: 'POST', token }) }

export async function rpc<T>(token: string, name: string, params: unknown = {}) {
  return keysToCamel<T>(await request(`/rest/v1/rpc/${name}`, { method: 'POST', token, body: params }))
}

export function restPath(table: string, query = '') { return `/rest/v1/${table}${query}` }

export function getStoragePublicUrl(bucket: string, objectPath: string) {
  const encoded = objectPath.split('/').map(encodeURIComponent).join('/')
  return `${trimSlash(SUPABASE_URL)}/storage/v1/object/public/${bucket}/${encoded}`
}

export async function uploadFile(filePath: string, token: string, folder = 'smis/mobile') {
  const cleanPath = filePath.split('?')[0] || filePath
  const rawExtension = cleanPath.includes('.') ? cleanPath.slice(cleanPath.lastIndexOf('.') + 1).toLowerCase() : 'jpg'
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(rawExtension) ? rawExtension : 'jpg'
  const objectPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
  const url = `${trimSlash(SUPABASE_URL)}/storage/v1/object/attachments/${objectPath}`
  return new Promise<string>((resolve, reject) => {
    uni.uploadFile({
      url, filePath, name: 'file',
      header: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'x-upsert': 'false' },
      success(response) {
        if ((response.statusCode || 0) >= 200 && (response.statusCode || 0) < 300) resolve(getStoragePublicUrl('attachments', objectPath))
        else {
          let data: unknown = response.data
          try { data = JSON.parse(response.data) } catch { /* plain text */ }
          reject(new ApiRequestError(data, '图片上传失败'))
        }
      },
      fail(error) { reject(new ApiRequestError(error.errMsg, '图片上传失败')) }
    })
  })
}
