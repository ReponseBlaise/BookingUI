import { useState } from 'react'

type ImportResult = {
  ok: boolean
  target: string
  dryRun: boolean
  summary: any
}

export default function useAdminImport() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File, type: string, dryRun = false) => {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const params = new URLSearchParams()
      params.set('type', type)
      if (dryRun) params.set('dryRun', 'true')
      const resp = await fetch(`/api/v1/admin/import?${params.toString()}`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(txt || 'Upload failed')
      }
      const json = await resp.json()
      setResult(json as ImportResult)
      return json
    } catch (err: any) {
      setError(String(err.message || err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getTemplateUrl = (name: string) => `/api/v1/admin/import/templates/${encodeURIComponent(name)}`

  return { loading, result, error, upload, getTemplateUrl }
}
