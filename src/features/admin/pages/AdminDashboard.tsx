import { useState, type ChangeEvent, type ReactNode, useEffect } from 'react'
import { FaBookOpen, FaChartBar, FaClipboardList, FaUsers } from 'react-icons/fa'
import { useAdminStats } from '../hooks/useAdminStats'
import { useBanUser } from '../hooks/useBanUser'
import { Spinner } from '../../../shared/components/Spinner'

type AdminDashboardProps = {
  onGoToModeration: () => void
  onGoToBookings: () => void
  onGoToImport?: () => void
}

export function AdminDashboard({ onGoToModeration, onGoToBookings, onGoToImport }: AdminDashboardProps) {
  const { data: stats, isLoading, isError } = useAdminStats()
  const banUser = useBanUser()
  const [banUserId, setBanUserId] = useState('')
  const [showBanConfirm, setShowBanConfirm] = useState(false)

  useEffect(() => {
    if (banUser.isSuccess) {
      setBanUserId('')
      setShowBanConfirm(false)
    }
  }, [banUser.isSuccess])

  const handleBanSubmit = () => {
    if (!banUserId.trim()) return
    banUser.mutate(banUserId.trim())
  }

  return (
    <main className="bg-[#f7f4ef] pb-12 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Admin</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Platform Dashboard</h1>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load stats.</p>
        ) : (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={stats?.totalUsers ?? 0} icon={<FaUsers className="text-blue-500" />} />
            <StatCard label="Total listings" value={stats?.totalListings ?? 0} icon={<FaClipboardList className="text-emerald-500" />} />
            <StatCard label="Total bookings" value={stats?.totalBookings ?? 0} icon={<FaBookOpen className="text-amber-500" />} />
            <StatCard label="Total revenue" value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`} icon={<FaChartBar className="text-[#ff4d2d]" />} />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <NavCard
            title="Moderation Queue"
            description="Review and approve or reject pending listings submitted by hosts."
            action="Go to moderation"
            onClick={onGoToModeration}
            color="bg-amber-50 border-amber-200"
          />
          <NavCard
            title="All Bookings"
            description="View all bookings across the platform with filters and pagination."
            action="View bookings"
            onClick={onGoToBookings}
            color="bg-blue-50 border-blue-200"
          />
          <NavCard
            title="Import Data"
            description="Bulk import users, listings, and bookings from CSV or Excel files. Use Dry Run to validate before applying."
            action="Import"
            onClick={() => onGoToImport && onGoToImport()}
            color="bg-green-50 border-green-200"
          />
        </div>

        {/* Ban User */}
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">Ban User</h2>
          <p className="mt-1 text-sm text-slate-600">
            Banning a user removes their listings from the moderation queue and cancels their bookings.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <input
              type="text"
              value={banUserId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBanUserId(e.target.value)}
              placeholder="Enter user ID"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
            />
            <button
              type="button"
              onClick={() => setShowBanConfirm(true)}
              disabled={!banUserId.trim()}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
            >
              Ban User
            </button>
          </div>

          {showBanConfirm && (
            <div className="mt-4 rounded-xl border border-red-300 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                Are you sure you want to ban user <span className="font-mono text-red-600">{banUserId}</span>?
              </p>
              <p className="mt-1 text-xs text-slate-500">This will invalidate all their listings and bookings.</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleBanSubmit}
                  disabled={banUser.isPending}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {banUser.isPending ? 'Banning...' : 'Confirm Ban'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBanConfirm(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
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
