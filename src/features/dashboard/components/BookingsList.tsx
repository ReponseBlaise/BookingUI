import { useMemo } from 'react'
import { useMyBookings } from '../../bookings'

export function BookingsList() {
  const { data, isLoading, isError } = useMyBookings()

  const items = useMemo(() => data ?? [], [data])

  if (isLoading) return <div className="p-4">Loading bookings…</div>
  if (isError) return <div className="p-4 text-red-600">Failed to load bookings</div>
  if (!items.length) return <div className="p-4">No bookings found.</div>

  return (
    <div className="space-y-3 p-4">
      {items.map(b => (
        <div key={b.id} className="rounded-md border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">{b.listingTitle ?? 'Listing'}</div>
              <div className="text-sm text-slate-500">{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</div>
            </div>
            <div className="text-sm font-semibold text-slate-700">${b.totalPrice}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BookingsList
