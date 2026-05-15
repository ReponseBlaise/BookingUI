const rawApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'
const API_URL = rawApiBase.replace(/\/$/, '').replace(/\/api\/v1$/, '')
const GET_CACHE_TTL = Number(import.meta.env.VITE_API_GET_CACHE_TTL_MS ?? 5000)

type CacheEntry = { ts: number; promise: Promise<any>; data?: any }
const GET_CACHE = new Map<string, CacheEntry>()

function normalizePath(path: string) {
  if (path.startsWith('/api/v1/')) return path
  if (path.startsWith('/api/')) return `/api/v1/${path.slice('/api/'.length)}`
  if (path.startsWith('/')) return `/api/v1${path}`
  return `/api/v1/${path}`
}

type RequestOptions = {
  headers?: Record<string, string>
  body?: unknown
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_URL}${normalizePath(path)}`
  const token = localStorage.getItem('authToken')
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers: Record<string, string> = {
    ...options.headers,
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Cache GET requests for a short TTL to avoid duplicate identical requests
  if (method === 'GET') {
    const key = url + JSON.stringify(options.headers ?? {})
    const existing = GET_CACHE.get(key)
    const now = Date.now()
    if (existing && (now - existing.ts) < GET_CACHE_TTL) {
      return existing.promise
    }
    const fetchPromise = (async () => {
      const resp = await fetch(url, {
        method,
        headers,
      })

      if (resp.status === 401) {
        localStorage.removeItem('authUser')
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        throw new Error('Unauthorized')
      }

      if (!resp.ok) {
        const err = await resp
          .json()
          .catch(async () => ({ message: await resp.text().catch(() => resp.statusText) }))
        throw new Error(err.message || err.error || `HTTP ${resp.status}`)
      }

      if (resp.status === 204) return undefined as T
      const body = await resp.json()
      // store resolved data for subsequent immediate callers
      const entry = GET_CACHE.get(key)
      if (entry) entry.data = body
      return body as T
    })()
    GET_CACHE.set(key, { ts: Date.now(), promise: fetchPromise })
    return fetchPromise
  }

  const response = await fetch(url, {
    method,
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  })

  if (response.status === 401) {
    localStorage.removeItem('authUser')
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(async () => ({ message: await response.text().catch(() => response.statusText) }))
    throw new Error(error.message || error.error || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const api = {
  get: <T,>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T,>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
}
