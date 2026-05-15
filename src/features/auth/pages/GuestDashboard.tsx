import { FaBookOpen, FaCalendarAlt, FaHeart, FaListAlt } from 'react-icons/fa'
import { useSavedListings } from '../../listings/hooks/useSavedListings'
import { useMyBookings } from '../../bookings/hooks/useMyBookings'
import { useAuth } from '../index'

type GuestDashboardProps = {
  onViewBookings: () => void
  onViewListings: () => void
}

export function GuestDashboard({ onViewBookings, onViewListings }: GuestDashboardProps) {
  const { user } = useAuth()
  const { data: savedIds = [], isLoading: savedLoading } = useSavedListings()
  const { data: bookings = [], isLoading: bookingsLoading } = useMyBookings()

  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING')
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0)

  return (
    <main className="bg-[#f6f5f1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-gradient-to-r from-[#ff4d2d] to-[#ffb020] p-8 text-white shadow-[0_20px_60px_rgba(255,77,45,0.22)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/75">Guest Dashboard</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Guest'}!
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
            You have {upcomingBookings.length} upcoming booking{upcomingBookings.length !== 1 ? 's' : ''} and {savedIds.length} saved listing{savedIds.length !== 1 ? 's' : ''}.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Saved listings"
            value={savedLoading ? '...' : String(savedIds.length)}
            icon={<FaHeart className="text-[#ff4d2d]" />}
          />
          <StatCard
            label="Total bookings"
            value={bookingsLoading ? '...' : String(bookings.length)}
            icon={<FaBookOpen className="text-blue-500" />}
          />
          <StatCard
            label="Upcoming trips"
            value={bookingsLoading ? '...' : String(upcomingBookings.length)}
            icon={<FaCalendarAlt className="text-emerald-500" />}
          />
          <StatCard
            label="Total spent"
            value={bookingsLoading ? '...' : `$${totalSpent.toLocaleString()}`}
            icon={<FaListAlt className="text-amber-500" />}
          />
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <NavCard
            title="My Bookings"
            description="View all your bookings, upcoming trips, and booking history."
            action="View bookings"
            onClick={onViewBookings}
            color="bg-blue-50 border-blue-200"
          />
          <NavCard
            title="Browse Listings"
            description="Discover new places to stay and save your favorites."
            action="Browse listings"
            onClick={onViewListings}
            color="bg-amber-50 border-amber-200"
          />
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xl">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </article>
  )
}

function NavCard({ title, description, action, onClick, color }: {
  title: string
  description: string
  action: string
  onClick: () => void
  color: string
}) {
  return (
    <div className={`rounded-2xl border p-6 ${color}`}>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 rounded-full bg-[#ff4d2d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff5b3f]"
      >
        {action}
      </button>
    </div>
  )
}
