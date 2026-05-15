import { useState } from 'react'
import { FaCheck, FaEdit, FaPlus, FaStar, FaTimes, FaTrash } from 'react-icons/fa'
import { useMyListings } from '../hooks/useMyListings'
import { useDeleteListing } from '../hooks/useDeleteListing'
import { useHostBookings } from '../hooks/useHostBookings'
import { useUpdateBookingStatus } from '../hooks/useUpdateBookingStatus'
import { Spinner } from '../../../shared/components/Spinner'
import type { Listing } from '../../listings/types'
import type { Booking } from '../../bookings/types'

type HostDashboardProps = {
  onCreateListing: () => void
  onEditListing: (id: string) => void
  initialTab?: 'listings' | 'bookings'
}

const listingStatusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

const bookingStatusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
}

export function HostDashboard({ onCreateListing, onEditListing, initialTab = 'listings' }: HostDashboardProps) {
  const [tab, setTab] = useState<'listings' | 'bookings'>(initialTab)
  const { data: listings = [], isLoading: listingsLoading } = useMyListings()
  const { data: bookings = [], isLoading: bookingsLoading } = useHostBookings()

  const totalEarnings = (bookings as Booking[]).reduce((sum, b) => sum + (b.totalPrice ?? 0), 0)
  const avgRating = listings.length
    ? (listings.reduce((sum, l) => sum + l.rating, 0) / listings.length).toFixed(2)
    : '—'

  return (
    <main className="bg-[#f7f4ef] pb-12 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Host</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">My Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={onCreateListing}
            className="inline-flex items-center gap-2 rounded-full bg-[#ff4d2d] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)] transition hover:bg-[#ff5b3f]"
          >
            <FaPlus aria-hidden="true" /> New listing
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total listings" value={String(listings.length)} />
          <StatCard label="Total bookings" value={String((bookings as Booking[]).length)} />
          <StatCard label="Total earnings" value={`$${totalEarnings.toLocaleString()}`} />
          <StatCard label="Avg rating" value={avgRating} icon={<FaStar className="text-[#ffb020]" />} />
        </div>

        <div className="mb-6 flex w-fit gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {(['listings', 'bookings'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${tab === t ? 'bg-[#ff4d2d] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'listings' && (
          listingsLoading ? <Spinner /> :
          listings.length === 0 ? (
            <EmptyState message="No listings yet." action="Create your first listing" onAction={onCreateListing} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} onEdit={() => onEditListing(listing.id)} />
              ))}
            </div>
          )
        )}

        {tab === 'bookings' && (
          bookingsLoading ? <Spinner /> :
          (bookings as Booking[]).length === 0 ? (
            <EmptyState message="No bookings yet." />
          ) : (
            <div className="grid gap-4">
              {(bookings as Booking[]).map(booking => (
                <HostBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-900">
        {icon}{value}
      </p>
    </article>
  )
}

function ListingCard({ listing, onEdit }: { listing: Listing; onEdit: () => void }) {
  const deleteMutation = useDeleteListing(listing.id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const status = listing.available ? 'published' : 'draft'

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {listing.img ? (
        <img src={listing.img} alt={listing.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-slate-300 flex items-center justify-center">
          <span className="text-slate-500 text-sm">No image</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{listing.title}</p>
            <p className="mt-0.5 truncate text-sm text-slate-500">{listing.location}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${listingStatusColors[status] ?? listingStatusColors.draft}`}>
            {status}
          </span>
        </div>
        <p className="mt-2 text-sm font-bold text-[#ff4d2d]">${listing.price} / night</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#ff4d2d] hover:text-[#ff4d2d]"
          >
            <FaEdit aria-hidden="true" /> Edit
          </button>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-400 hover:text-red-600"
            >
              <FaTrash aria-hidden="true" /> Delete
            </button>
          ) : (
            <div className="flex flex-1 gap-1">
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-full bg-red-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {deleteMutation.isPending ? '...' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function HostBookingCard({ booking }: { booking: Booking }) {
  const updateStatus = useUpdateBookingStatus(booking.id)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-900">
            {(booking as Booking & { listingTitle?: string }).listingTitle || `Booking #${booking.id.slice(-6)}`}
          </p>
          <p className="text-slate-500">
            Guest: {(booking as Booking & { guestName?: string }).guestName || 'Guest'}
          </p>
          <p className="text-slate-500">{booking.checkIn} → {booking.checkOut}</p>
          <p className="text-slate-500">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
          <p className="font-bold text-[#ff4d2d]">${booking.totalPrice}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${bookingStatusColors[booking.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {booking.status}
          </span>
          {booking.status === 'PENDING' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateStatus.mutate('CONFIRMED')}
                disabled={updateStatus.isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <FaCheck aria-hidden="true" /> Approve
              </button>
              <button
                type="button"
                onClick={() => updateStatus.mutate('CANCELLED')}
                disabled={updateStatus.isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              >
                <FaTimes aria-hidden="true" /> Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message, action, onAction }: { message: string; action?: string; onAction?: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <p className="font-semibold text-slate-700">{message}</p>
      {action && onAction && (
        <button type="button" onClick={onAction} className="mt-4 rounded-full bg-[#ff4d2d] px-5 py-2.5 text-sm font-semibold text-white">
          {action}
        </button>
      )}
    </div>
  )
}
