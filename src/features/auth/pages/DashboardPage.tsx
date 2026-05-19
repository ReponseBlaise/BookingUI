import { useState, type ReactNode } from 'react'
import {
  FaChartLine,
  FaHome,
  FaTachometerAlt,
  FaRegCommentDots,
  FaList,
  FaClipboardList,
  FaChevronLeft,
  FaUsers,
  FaHeart,
  FaCalendarAlt,
  FaDollarSign,
  FaBookOpen,
  FaShieldAlt,
  FaPlus,
} from 'react-icons/fa'
import { useAdminStats } from '../../admin/hooks/useAdminStats'
import { useMyBookings } from '../../bookings/hooks/useMyBookings'
import { useSavedListings } from '../../listings/hooks/useSavedListings'
import { useAuth } from '../index'
import { withAuth } from '../../../shared/hocs/withAuth'

type DashboardPageProps = {
  onViewBookings: (status?: 'all' | 'pending' | 'confirmed' | 'paid') => void
  onBrowseListings: () => void
  onOpenHostDashboard: (initialTab?: 'listings' | 'bookings') => void
  onCreateListing: () => void
  onEditListing: (id: string) => void
  onGoModeration: () => void
  onGoAllBookings: () => void
  onGoUsers: () => void
}

type ActiveMenu =
  | 'dashboard'
  | 'messages'
  | 'add-listing'
  | 'my-listings'
  | 'my-bookings'
  | 'earnings'
  | 'pending-bookings'
  | 'confirmed-bookings'
  | 'paid-bookings'
  | 'users'
  | 'moderation'
  | 'bookings'
  | 'listings'

function DashboardPage({
  onViewBookings,
  onBrowseListings,
  onOpenHostDashboard,
  onCreateListing,
  onEditListing,
  onGoModeration,
  onGoAllBookings,
  onGoUsers,
}: DashboardPageProps) {
  void onEditListing

  const { user } = useAuth()
  const { data: stats } = useAdminStats()
  const { data: myBookings = [], isLoading: bookingsLoading } = useMyBookings()
  const { data: savedIds = [], isLoading: savedLoading } = useSavedListings()
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard')
  const effectiveRole = user?.preferredRole ?? user?.role ?? 'GUEST'

  const upcomingBookings = myBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING')
  const totalSpent = myBookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0)

  type MenuItem = {
    key: ActiveMenu
    label: string
    description: string
    action: () => void
    actionLabel: string
    icon: ReactNode
  }

  const hostMenu: MenuItem[] = [
    {
      key: 'add-listing',
      label: 'Add listing',
      description: 'Create a new Rwanda-based listing and upload photos from the host flow.',
      action: onCreateListing,
      actionLabel: 'Create listing',
      icon: <FaPlus />,
    },
    {
      key: 'my-listings',
      label: 'My Listings',
      description: 'Review and edit your own listings, photos, and publishing status.',
      action: () => onOpenHostDashboard('listings'),
      actionLabel: 'Open host dashboard',
      icon: <FaList />,
    },
    {
      key: 'my-bookings',
      label: 'My Bookings',
      description: 'See booking requests for your listings and approve or decline them.',
      action: () => onOpenHostDashboard('bookings'),
      actionLabel: 'Open bookings',
      icon: <FaClipboardList />,
    },
    {
      key: 'earnings',
      label: 'Earnings (by listing)',
      description: 'Check booking income by listing from the host dashboard summary.',
      action: () => onOpenHostDashboard('bookings'),
      actionLabel: 'View earnings',
      icon: <FaChartLine />,
    },
    {
      key: 'messages',
      label: 'Messages',
      description: 'Open your conversation area and keep guest communication in one place.',
      action: () => undefined,
      actionLabel: 'Open messages',
      icon: <FaRegCommentDots />,
    },
  ]

  const guestMenu: MenuItem[] = [
    {
      key: 'pending-bookings',
      label: 'My bookings (pending)',
      description: 'Review bookings waiting for confirmation.',
      action: () => onViewBookings('pending'),
      actionLabel: 'Show pending',
      icon: <FaClipboardList />,
    },
    {
      key: 'confirmed-bookings',
      label: 'My bookings (confirmed)',
      description: 'Track trips that have already been confirmed by hosts.',
      action: () => onViewBookings('confirmed'),
      actionLabel: 'Show confirmed',
      icon: <FaClipboardList />,
    },
    {
      key: 'paid-bookings',
      label: 'My bookings (paid)',
      description: 'See bookings that are confirmed and payment-ready.',
      action: () => onViewBookings('paid'),
      actionLabel: 'Show paid',
      icon: <FaClipboardList />,
    },
    {
      key: 'messages',
      label: 'Messages',
      description: 'Open your guest inbox and conversation history.',
      action: () => undefined,
      actionLabel: 'Open messages',
      icon: <FaRegCommentDots />,
    },
  ]

  const adminMenu: MenuItem[] = [
    {
      key: 'users',
      label: 'Users',
      description: 'Inspect active and inactive platform users from the admin workspace.',
      action: onGoUsers,
      actionLabel: 'Open user management',
      icon: <FaUsers />,
    },
    {
      key: 'moderation',
      label: 'Moderation Queue',
      description: 'Review and approve or reject pending listings submitted by hosts.',
      action: onGoModeration,
      actionLabel: 'Open moderation',
      icon: <FaShieldAlt />,
    },
    {
      key: 'bookings',
      label: 'Bookings',
      description: 'Review all platform bookings with filters and pagination.',
      action: onGoAllBookings,
      actionLabel: 'View bookings',
      icon: <FaClipboardList />,
    },
  ]

  const roleMenu = effectiveRole === 'HOST' ? hostMenu : effectiveRole === 'ADMIN' ? adminMenu : guestMenu

  const dashboardBars =
    effectiveRole === 'GUEST'
      ? [
          {
            label: 'Saved listings',
            value: savedLoading ? '...' : String(savedIds.length),
            icon: <FaHeart className="text-[#ff4d2d]" />,
          },
          {
            label: 'Total bookings',
            value: bookingsLoading ? '...' : String(myBookings.length),
            icon: <FaBookOpen className="text-blue-500" />,
          },
          {
            label: 'Upcoming trips',
            value: bookingsLoading ? '...' : String(upcomingBookings.length),
            icon: <FaCalendarAlt className="text-emerald-500" />,
          },
          {
            label: 'Total spent',
            value: bookingsLoading ? '...' : `$${totalSpent.toLocaleString()}`,
            icon: <FaDollarSign className="text-amber-500" />,
          },
        ]
      : [
          {
            label: 'Total users',
            value: String(stats?.totalUsers ?? 0),
            icon: <FaUsers className="text-[#ff4d2d]" />,
          },
          {
            label: 'Total listings',
            value: String(stats?.totalListings ?? 0),
            icon: <FaList className="text-slate-700" />,
          },
          {
            label: 'Total bookings',
            value: String(stats?.totalBookings ?? 0),
            icon: <FaClipboardList className="text-emerald-600" />,
          },
        ]

  const gridCols = effectiveRole === 'GUEST' ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'

  // Items that navigate away — clicking these fires their action and leaves the page
  const navigatingKeys: ActiveMenu[] = [
    'add-listing', 'my-listings', 'my-bookings', 'earnings',
    'pending-bookings', 'confirmed-bookings', 'paid-bookings',
    'users', 'moderation', 'bookings', 'listings',
  ]

  const handleMenuClick = (item: MenuItem) => {
    setActiveMenu(item.key)
    item.action()
  }

  // Right-panel content: stats panel (default) or messages placeholder
  const showMessages = activeMenu === 'messages' && !navigatingKeys.includes(activeMenu)

  return (
    <main className="bg-[#f6f5f1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        {/* Sidebar */}
        <aside
          className="mb-6 rounded-3xl bg-[#f2f0f0] p-6 lg:mb-0 lg:min-h-[calc(100vh-10rem)]"
          style={{ fontFamily: 'Poppins, Segoe UI, system-ui, sans-serif' }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Main menu</p>
          <ul className="space-y-2">
            <SidebarItem
              active={activeMenu === 'dashboard'}
              icon={<FaTachometerAlt />}
              label="Dashboard"
              onClick={() => setActiveMenu('dashboard')}
            />
            {effectiveRole === 'GUEST' && (
              <SidebarItem
                active={false}
                icon={<FaHome />}
                label="Browse listings"
                onClick={onBrowseListings}
                rightIcon={<FaChevronLeft className="text-xs" />}
              />
            )}
          </ul>

          <p className="mb-4 mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {effectiveRole === 'HOST'
              ? 'Host tools'
              : effectiveRole === 'ADMIN'
                ? 'Admin tools'
                : 'Guest tools'}
          </p>
          <ul className="space-y-2">
            {roleMenu.map(item => (
              <SidebarItem
                key={item.key}
                active={activeMenu === item.key}
                icon={item.icon}
                rightIcon={<FaChevronLeft className="text-xs" />}
                label={item.label}
                onClick={() => handleMenuClick(item)}
              />
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <div className="space-y-6">
          {/* Hero */}
          <section className="overflow-hidden rounded-4xl bg-linear-to-r from-[#ff4d2d] to-[#ffb020] p-8 text-white shadow-[0_20px_60px_rgba(255,77,45,0.22)] sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/75">Dashboard</p>
                <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                  Welcome back, {user?.name?.split(' ')[0] ?? 'traveler'}.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  {effectiveRole === 'HOST' && 'Manage your listings, bookings, and guest requests in one place.'}
                  {effectiveRole === 'ADMIN' && 'Oversee the platform with live totals from the database.'}
                  {effectiveRole === 'GUEST' && 'Your bookings, savings, and upcoming trips — all at a glance.'}
                </p>
              </div>

              <div className={`grid gap-3 ${gridCols}`}>
                {dashboardBars.map(bar => (
                  <MiniMetric key={bar.label} icon={bar.icon} label={bar.label} value={bar.value} />
                ))}
              </div>
            </div>
          </section>

          {/* Messages coming-soon panel */}
          {showMessages ? (
            <section className="flex flex-col items-center justify-center gap-4 rounded-4xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl text-slate-400">
                <FaRegCommentDots />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Messages</h2>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  In-app messaging is coming soon. Stay tuned for updates.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-700">
                Coming soon
              </span>
            </section>
          ) : (
            /* Stats / activity panel */
            <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff4d2d]">Stats</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                {effectiveRole === 'GUEST' ? 'Your activity' : 'Platform totals'}
              </h2>
              <div className={`mt-4 grid gap-4 ${gridCols}`}>
                {dashboardBars.map(bar => (
                  <article key={bar.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                      {bar.icon}
                    </div>
                    <p className="text-sm text-slate-500">{bar.label}</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{bar.value}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Quick-action cards for guest — browse + bookings */}
          {effectiveRole === 'GUEST' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickCard
                title="My Bookings"
                description="View all your bookings, upcoming trips, and booking history."
                action="View bookings"
                onClick={() => onViewBookings('all')}
                color="bg-blue-50 border-blue-200"
              />
              <QuickCard
                title="Browse Listings"
                description="Discover new places to stay and save your favorites."
                action="Browse listings"
                onClick={onBrowseListings}
                color="bg-amber-50 border-amber-200"
              />
            </div>
          )}

          {/* Quick-action cards for admin */}
          {effectiveRole === 'ADMIN' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickCard
                title="Moderation Queue"
                description="Review and approve or reject pending listings submitted by hosts."
                action="Go to moderation"
                onClick={onGoModeration}
                color="bg-amber-50 border-amber-200"
              />
              <QuickCard
                title="All Bookings"
                description="View all bookings across the platform with filters and pagination."
                action="View bookings"
                onClick={onGoAllBookings}
                color="bg-blue-50 border-blue-200"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function SidebarItem({
  active,
  icon,
  label,
  onClick,
  badge,
  rightIcon,
}: {
  active: boolean
  icon: ReactNode
  label: string
  onClick: () => void
  badge?: string
  rightIcon?: ReactNode
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`group relative flex w-full items-center gap-3 rounded-full px-4 py-3 text-left transition ${
          active ? 'bg-[#f6deda] text-[#ff4d2d]' : 'text-slate-700 hover:bg-[#ece9e9]'
        }`}
      >
        {active && <span className="absolute -left-6 top-0 h-full w-1 rounded-r bg-[#ff4d2d]" />}
        <span className="text-base">{icon}</span>
        <span className="text-[15px] font-medium leading-tight">{label}</span>
        {badge && (
          <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-2 text-xs font-bold text-white">
            {badge}
          </span>
        )}
        {rightIcon && <span className="ml-auto text-slate-500">{rightIcon}</span>}
      </button>
    </li>
  )
}

function MiniMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-white/85">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.28em]">{label}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </article>
  )
}

function QuickCard({
  title,
  description,
  action,
  onClick,
  color,
}: {
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

export default withAuth(DashboardPage)
