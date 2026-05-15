import { useHostBookings, useApproveBooking, useDeclineBooking } from '../index'
import { useState, useMemo, useEffect } from 'react'
import { Spinner } from '../../../shared/components/Spinner'
import type { Booking } from '../types'

type HostBookingsPageProps = {
  onOpenListing?: (listingId: string) => void
  initialStatus?: 'all' | 'pending' | 'confirmed'
}

export function HostBookingsPage({ onOpenListing, initialStatus = 'pending' }: HostBookingsPageProps) {
  const { data: bookings, isLoading, isError, refetch } = useHostBookings()
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed'>(initialStatus)

  useEffect(() => {
    setStatusFilter(initialStatus)
  }, [initialStatus])

  const filteredBookings = useMemo(() => {
    const list = bookings ?? []
    if (statusFilter === 'all') return list
    if (statusFilter === 'pending') return list.filter(booking => booking.status === 'PENDING')
    if (statusFilter === 'confirmed') return list.filter(booking => booking.status === 'CONFIRMED')
    return list
  }, [bookings, statusFilter])

  const pendingCount = (bookings ?? []).filter(booking => booking.status === 'PENDING').length
  const confirmedCount = (bookings ?? []).filter(booking => booking.status === 'CONFIRMED').length

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
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Host</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Booking Requests</h1>
          <p className="mt-2 text-sm text-slate-600">Review and manage reservation requests from guests.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterPill label={`All (${(bookings ?? []).length})`} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
          <FilterPill label={`Pending (${pendingCount})`} active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} />
          <FilterPill label={`Confirmed (${confirmedCount})`} active={statusFilter === 'confirmed'} onClick={() => setStatusFilter('confirmed')} />
        </div>

        {!filteredBookings || filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              {statusFilter === 'pending' ? 'No pending requests' : 'No bookings'}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {statusFilter === 'pending' 
                ? 'You have no pending reservation requests.' 
                : 'Change filter to see more bookings.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map(booking => (
              <HostBookingCard
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

function HostBookingCard({ booking, onOpenListing }: { booking: Booking; onOpenListing?: (listingId: string) => void }) {
  const approveMutation = useApproveBooking(booking.id)
  const declineMutation = useDeclineBooking(booking.id)
  const canActOn = booking.status === 'PENDING'

  const guestName = (booking as Booking & { guestName?: string }).guestName || 'Guest'
  const guestEmail = (booking as Booking & { guestEmail?: string }).guestEmail || ''

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
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
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              {(booking as Booking & { listingTitle?: string }).listingTitle || `Booking #${booking.id.slice(-6)}`}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Guest:</span> {guestName}</p>
              {guestEmail && <p><span className="font-medium">Email:</span> {guestEmail}</p>}
              <p><span className="font-medium">Check-in:</span> {booking.checkIn}</p>
              <p><span className="font-medium">Check-out:</span> {booking.checkOut}</p>
              <p><span className="font-medium">Total Price:</span> <span className="font-bold text-[#ff4d2d]">${booking.totalPrice}</span></p>
            </div>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[booking.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {booking.status}
            </span>
          </div>
        </button>

        {canActOn && (
          <div className="flex flex-col gap-2 sm:min-w-[200px]">
            <button
              type="button"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending || declineMutation.isPending}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
            <button
              type="button"
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending || approveMutation.isPending}
              className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              {declineMutation.isPending ? 'Declining...' : 'Decline'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
