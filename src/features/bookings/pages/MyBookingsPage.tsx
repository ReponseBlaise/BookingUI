import { useMyBookings, useCancelBooking } from '../index'
import { useEffect, useMemo, useState } from 'react'
import { Spinner } from '../../../shared/components/Spinner'
import type { Booking } from '../types'

type MyBookingsPageProps = {
  onOpenListing?: (listingId: string) => void
  initialStatus?: 'all' | 'pending' | 'confirmed' | 'paid'
}

export function MyBookingsPage({ onOpenListing, initialStatus = 'all' }: MyBookingsPageProps) {
  const { data: bookings, isLoading, isError, refetch } = useMyBookings()
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'paid'>(initialStatus)

  useEffect(() => {
    setStatusFilter(initialStatus)
  }, [initialStatus])

  const filteredBookings = useMemo(() => {
    const list = bookings ?? []
    if (statusFilter === 'all') return list
    if (statusFilter === 'pending') return list.filter(booking => booking.status === 'PENDING')
    if (statusFilter === 'confirmed') return list.filter(booking => booking.status === 'CONFIRMED')
    return list.filter(booking => booking.status === 'CONFIRMED')
  }, [bookings, statusFilter])

  const pendingCount = (bookings ?? []).filter(booking => booking.status === 'PENDING').length
  const confirmedCount = (bookings ?? []).filter(booking => booking.status === 'CONFIRMED').length
  const paidCount = confirmedCount

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <main className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7f4ef]">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Failed to load bookings</p>
          <p className="mt-2 text-sm text-slate-600">Please try again later</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-[#ff4d2d] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#f7f4ef] pb-10 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Guest</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">My Bookings</h1>
          <p className="mt-2 text-sm text-slate-600">Track your pending, confirmed, and paid bookings.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterPill label={`All (${(bookings ?? []).length})`} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
          <FilterPill label={`Pending (${pendingCount})`} active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} />
          <FilterPill label={`Confirmed (${confirmedCount})`} active={statusFilter === 'confirmed'} onClick={() => setStatusFilter('confirmed')} />
          <FilterPill label={`Paid (${paidCount})`} active={statusFilter === 'paid'} onClick={() => setStatusFilter('paid')} />
        </div>

        {!filteredBookings || filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No bookings in this state</p>
            <p className="mt-2 text-sm text-slate-600">Change filter or explore listings to make your next booking.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onOpenListing={onOpenListing}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${active ? 'bg-[#ff4d2d] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-[#ff4d2d] hover:text-[#ff4d2d]'}`}
    >
      {label}
    </button>
  )
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
}

function BookingCard({ booking, onOpenListing }: { booking: Booking; onOpenListing?: (listingId: string) => void }) {
  const cancelMutation = useCancelBooking(booking.id)
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED'

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px] sm:items-start">
        <button
          type="button"
          onClick={() => onOpenListing?.(booking.listingId)}
          className="flex gap-4 text-left"
        >
          <img
            src={(booking as Booking & { listingImage?: string }).listingImage
              || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80'}
            alt={(booking as Booking & { listingTitle?: string }).listingTitle || 'Listing'}
            className="h-24 w-24 shrink-0 rounded-2xl object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {(booking as Booking & { listingTitle?: string }).listingTitle || `Booking #${booking.id.slice(-6)}`}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Check-in:</span> {booking.checkIn}</p>
              <p><span className="font-medium">Check-out:</span> {booking.checkOut}</p>
              <p><span className="font-medium">Guests:</span> {booking.guests}</p>
              <p><span className="font-medium">Total:</span> <span className="font-bold text-[#ff4d2d]">${booking.totalPrice}</span></p>
            </div>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[booking.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {booking.status}
            </span>
          </div>
        </button>

        {canCancel && (
          <div className="sm:text-right">
            <button
              type="button"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
