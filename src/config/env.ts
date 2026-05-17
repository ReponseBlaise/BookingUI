type AppEnv = {
  readonly apiUrl: string
  readonly apiGetCacheTtlMs: number
  readonly isDev: boolean
  readonly isProd: boolean
}

const rawEnv = import.meta.env

export const config: AppEnv = {
  apiUrl: rawEnv.VITE_API_URL ?? rawEnv.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  apiGetCacheTtlMs: Number(rawEnv.VITE_API_GET_CACHE_TTL_MS ?? 5000),
  isDev: rawEnv.DEV,
  isProd: rawEnv.PROD,
}
