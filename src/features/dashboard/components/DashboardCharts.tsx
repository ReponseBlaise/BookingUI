import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

export default function DashboardCharts() {
  const [data, setData] = useState<{ label: string; value: number }[]>([])

  useEffect(() => {
    let mounted = true
    api.get('/admin/stats').then((s: any) => {
      if (!mounted) return
      setData([
        { label: 'Users', value: s.users ?? s.totalUsers ?? 0 },
        { label: 'Listings', value: s.listings ?? s.totalListings ?? 0 },
        { label: 'Bookings', value: s.bookings ?? s.totalBookings ?? 0 },
        { label: 'Payments', value: s.payments ?? 0 },
      ])
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const max = Math.max(1, ...data.map(d => d.value))

  return (
    <div className="mt-6 grid grid-cols-4 gap-4">
      {data.map(d => (
        <div key={d.label} className="rounded-2xl bg-white p-4 text-center">
          <div className="h-24 flex items-end justify-center">
            <div style={{ height: `${(d.value / max) * 100}%` }} className="w-12 bg-amber-400 rounded-t-md" />
          </div>
          <div className="mt-3 text-sm text-slate-600">{d.label}</div>
          <div className="text-xl font-bold">{d.value}</div>
        </div>
      ))}
    </div>
  )
}
