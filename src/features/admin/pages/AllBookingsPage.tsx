import { useState, type ChangeEvent } from 'react'
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useAllBookings } from '../hooks/useAllBookings'
import { Spinner } from '../../../shared/components/Spinner'
import type { BookingStatus } from '../../bookings/types'

type AllBookingsPageProps = {
  onBack: () => void
}

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const PAGE_SIZE = 10

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
}

export function AllBookingsPage({ onBack }: AllBookingsPageProps) {
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, isError } = useAllBookings({ status, from, to, page, pageSize: PAGE_SIZE, search })

  const bookings = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleFilterChange = (newStatus: string) => {
    setStatus(newStatus)
    setPage(1)
  }

  return (
    <main className="bg-[#f7f4ef] pb-12 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#ff4d2d]"
        >
          <FaArrowLeft aria-hidden="true" /> Back to admin
        </button>

            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Admin</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">All Bookings</h1>
            {!isLoading && (
              <p className="mt-1 text-sm text-slate-500">
                {total.toLocaleString()} booking{total !== 1 ? 's' : ''}
                {isFetching && <span className="ml-2 text-slate-400">Refreshing...</span>}
              </p>
            )}
          </div>

          {/* Date filters */}
          <div className="flex flex-wrap gap-3">
            <div>
              <input
                type="text"
                placeholder="Search bookings by id, guest, or listing..."
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1) }}
                className="min-w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ff4d2d]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">From</label>
              <input
                type="date"
                value={from}
                onChange={(e: ChangeEvent<HTMLInputElement>) => { setFrom(e.target.value); setPage(1) }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ff4d2d]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">To</label>
              <input
                type="date"
                value={to}
                onChange={(e: ChangeEvent<HTMLInputElement>) => { setTo(e.target.value); setPage(1) }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ff4d2d]"
              />
            </div>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleFilterChange(opt.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${status === opt.value ? 'bg-[#ff4d2d] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#ff4d2d] hover:text-[#ff4d2d]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load bookings.</p>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-slate-700">No bookings found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {['Booking ID', 'Check-in', 'Check-out', 'Guests', 'Total', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">#{booking.id.slice(-8)}</td>
                      <td className="px-4 py-3 text-slate-700">{booking.checkIn}</td>
                      <td className="px-4 py-3 text-slate-700">{booking.checkOut}</td>
                      <td className="px-4 py-3 text-slate-700">{booking.guests}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">${booking.totalPrice}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[booking.status as BookingStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#ff4d2d] hover:text-[#ff4d2d] disabled:opacity-40"
                >
                  <FaChevronLeft aria-hidden="true" /> Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#ff4d2d] hover:text-[#ff4d2d] disabled:opacity-40"
                >
                  Next <FaChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
