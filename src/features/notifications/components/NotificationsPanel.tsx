import { useState } from 'react'
import { useNotifications, useMarkNotificationRead } from '../hooks/useNotifications'

export default function NotificationsPanel() {
  const { data: items = [], isLoading } = useNotifications()
  const mark = useMarkNotificationRead()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="w-full">
      <h3 className="mb-3 text-lg font-bold">Notifications</h3>
      <ul className="space-y-2">
        {items.map((n: any) => (
          <li key={n.id} className={`flex items-start justify-between rounded-lg border p-3 ${n.read ? 'bg-white' : 'bg-amber-50'}`}>
            <div>
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs text-slate-600">{n.body}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.read && (
              <button
                className="ml-4 rounded bg-amber-600 px-3 py-1 text-white text-sm"
                onClick={async () => {
                  setLoadingId(n.id)
                  try { await mark.mutateAsync(n.id) } finally { setLoadingId(null) }
                }}
                disabled={loadingId === n.id}
              >
                Mark
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
