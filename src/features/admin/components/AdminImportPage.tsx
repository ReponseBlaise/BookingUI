import React, { useState } from 'react'
import useAdminImport from '../hooks/useAdminImport'

export default function AdminImportPage() {
  const { loading, result, error, upload, getTemplateUrl } = useAdminImport()
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState('users')
  const [dryRun, setDryRun] = useState(true)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Please select a file')
    try {
      await upload(file, type, dryRun)
    } catch (err) {
      // already handled in hook
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Admin Import</h2>
      <div className="mb-4">
        <label className="block mb-1">Template</label>
        <div className="flex gap-2">
          <a className="text-sky-600 underline" href={getTemplateUrl('users.csv')} target="_blank" rel="noreferrer">Users CSV</a>
          <a className="text-sky-600 underline" href={getTemplateUrl('listings.csv')} target="_blank" rel="noreferrer">Listings CSV</a>
          <a className="text-sky-600 underline" href={getTemplateUrl('bookings.csv')} target="_blank" rel="noreferrer">Bookings CSV</a>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Target</label>
          <select value={type} onChange={e => setType(e.target.value)} className="border px-2 py-1">
            <option value="users">Users</option>
            <option value="listings">Listings</option>
            <option value="bookings">Bookings</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">File</label>
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />
            <span>Dry run (validate only)</span>
          </label>
        </div>

        <div>
          <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Running...' : 'Upload'}</button>
        </div>
      </form>

      <div className="mt-6">
        {error && <div className="text-red-600">{error}</div>}
        {result && (
          <div>
            <h3 className="font-medium">Result</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-64">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
