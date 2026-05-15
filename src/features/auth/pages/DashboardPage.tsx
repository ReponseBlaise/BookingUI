import { useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import {
  FaChartLine,
  FaHome,
  FaTachometerAlt,
  FaWallet,
  FaRegCommentDots,
  FaList,
  FaStar,
  FaClipboardList,
  FaBookmark,
  FaChevronLeft,
  FaShieldAlt,
  FaChartBar,
} from 'react-icons/fa'
import { useSavedListings } from '../../listings/hooks/useSavedListings'
import { useMyBookings } from '../../bookings/hooks/useMyBookings'
import { useHostBookings } from '../../host/hooks/useHostBookings'
import { useAuth } from '../index'
import { withAuth } from '../../../shared/hocs/withAuth'

type DashboardPageProps = {
  onViewBookings: (status?: 'all' | 'pending' | 'confirmed' | 'paid') => void
  onBrowseListings: () => void
  onOpenHostDashboard: () => void
  onCreateListing: () => void
  onEditListing: (id: string) => void
  onGoModeration: () => void
  onGoAllBookings: () => void
}

function DashboardPage({
  onViewBookings,
  onBrowseListings,
  onOpenHostDashboard,
  onCreateListing,
  onEditListing,
  onGoModeration,
  onGoAllBookings,
}: DashboardPageProps) {
  const { user } = useAuth()
  const { data: savedListings = [] } = useSavedListings()
  const { data: bookings = [] } = useMyBookings()
  const { data: hostBookings = [] } = useHostBookings()
  const effectiveSavedListings = user ? savedListings : []
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const effectiveRole = user?.preferredRole ?? user?.role ?? 'GUEST'
  const roleBookings = effectiveRole === 'HOST' ? hostBookings : bookings
  const upcomingBookings = roleBookings.filter(booking => booking.status === 'CONFIRMED' || booking.status === 'PENDING')
  const totalBookings = roleBookings.length
  const pendingBookings = roleBookings.filter(booking => booking.status === 'PENDING').length
  const confirmedBookings = roleBookings.filter(booking => booking.status === 'CONFIRMED').length
  const paidBookings = roleBookings.filter(booking => booking.status === 'CONFIRMED').length
  const hostMenu = [
    { key: 'add-listing', label: 'Add listing', action: onCreateListing },
    { key: 'my-listing', label: 'My Listings', action: onOpenHostDashboard },
    { key: 'bookings', label: 'My Bookings', action: onOpenHostDashboard },
    { key: 'earnings', label: 'Earnings (by listing)', action: () => toast('Earnings by listing comes from your host dashboard summary') },
    { key: 'messages', label: 'Messages', action: () => toast('Messaging is not yet modeled in the backend') },
  ]
  const guestMenu = [
    { key: 'pending-bookings', label: 'My bookings (pending)', action: () => onViewBookings('pending') },
    { key: 'confirmed-bookings', label: 'My bookings (confirmed)', action: () => onViewBookings('confirmed') },
    { key: 'paid-bookings', label: 'My bookings (paid)', action: () => onViewBookings('paid') },
    { key: 'messages', label: 'Messages', action: () => toast('Messaging is not yet modeled in the backend') },
  ]
  const adminMenu = [
    { key: 'users', label: 'Users (active/inactive)', action: () => toast('Open Users management from Admin dashboard') },
    { key: 'bookings', label: 'Bookings', action: onGoAllBookings },
    { key: 'listings', label: 'Listings', action: onBrowseListings },
  ]

  const dashboardBars = [
    { label: 'Saved', value: effectiveSavedListings.length, color: 'bg-[#ff4d2d]' },
    { label: 'Bookings', value: totalBookings, color: 'bg-slate-700' },
    { label: 'Upcoming', value: upcomingBookings.length, color: 'bg-emerald-600' },
  ]

  void onEditListing
  void onGoModeration
  void onGoAllBookings

  return (
    <main className="bg-[#f6f5f1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
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
            {effectiveRole === 'HOST' && (
              <SidebarItem
                active={activeMenu === 'add-listing'}
                icon={<FaHome />}
                label="Add listing"
                onClick={() => {
                  setActiveMenu('add-listing')
                  onCreateListing()
                }}
              />
            )}
            <SidebarItem
              active={activeMenu === 'wallet'}
              icon={<FaWallet />}
              label="Wallet"
              onClick={() => {
                setActiveMenu('wallet')
                toast('Wallet screen coming soon')
              }}
            />
            <SidebarItem
              active={activeMenu === 'message'}
              icon={<FaRegCommentDots />}
              label="Message"
              badge="2"
              onClick={() => {
                setActiveMenu('message')
                toast('Messaging API is not enabled yet on backend')
              }}
            />
          </ul>

          <p className="mb-4 mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Listing</p>
          <ul className="space-y-2">
            <SidebarItem
              active={activeMenu === 'my-listing'}
              icon={<FaList />}
              rightIcon={<FaChevronLeft className="text-xs" />}
              label="My Listings"
              onClick={() => {
                setActiveMenu('my-listing')
                if (effectiveRole === 'HOST') {
                  onOpenHostDashboard()
                  return
                }
                onBrowseListings()
              }}
            />
            <SidebarItem
              active={activeMenu === 'reviews'}
              icon={<FaStar />}
              label="Reviews"
              onClick={() => {
                setActiveMenu('reviews')
                toast('Reviews panel is coming soon')
              }}
            />
            <SidebarItem
              active={activeMenu === 'bookings'}
              icon={<FaClipboardList />}
              label="Bookings"
              onClick={() => {
                setActiveMenu('bookings')
                onViewBookings('all')
              }}
            />
            <SidebarItem
              active={activeMenu === 'bookmark'}
              icon={<FaBookmark />}
              label="Bookmark"
              onClick={() => {
                setActiveMenu('bookmark')
                onBrowseListings()
              }}
            />
            <SidebarItem
              active={false}
              icon={<FaChartLine />}
              rightIcon={<FaChevronLeft className="text-xs" />}
              label="Multi Level Menu"
              onClick={() => toast('Extra menu coming soon')}
            />
          </ul>
        </aside>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-4xl bg-linear-to-r from-[#ff4d2d] to-[#ffb020] p-8 text-white shadow-[0_20px_60px_rgba(255,77,45,0.22)] sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/75">Dashboard</p>
                <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] sm:text-5xl">Welcome back, {user?.name?.split(' ')[0] ?? 'traveler'}.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  {effectiveRole === 'HOST' && 'Manage your listings, bookings, and guest requests in one place.'}
                  {effectiveRole === 'ADMIN' && 'Oversee the platform, moderate content, and manage bookings at scale.'}
                  {effectiveRole === 'GUEST' && `You have ${effectiveSavedListings.length} saved listing${effectiveSavedListings.length === 1 ? '' : 's'} ready to revisit.`}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MiniMetric icon={<FaHome />} label="Saved" value={String(effectiveSavedListings.length)} />
                <MiniMetric icon={<FaChartLine />} label="Bookings" value={String(totalBookings)} />
                <MiniMetric icon={<FaShieldAlt />} label="Upcoming" value={String(upcomingBookings.length)} />
              </div>
            </div>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff4d2d]">Overview</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Role summary</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <OverviewCard label="Pending bookings" value={String(pendingBookings)} />
              <OverviewCard label="Confirmed bookings" value={String(confirmedBookings)} />
              <OverviewCard label="Paid bookings" value={String(paidBookings)} />
            </div>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff4d2d]">Menu</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              {effectiveRole === 'HOST' ? 'Host tools' : effectiveRole === 'ADMIN' ? 'Admin tools' : 'Guest tools'}
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(effectiveRole === 'HOST' ? hostMenu : effectiveRole === 'ADMIN' ? adminMenu : guestMenu).map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveMenu(item.key)
                    item.action()
                  }}
                  className={`rounded-3xl border p-5 text-left transition ${activeMenu === item.key ? 'border-[#ff4d2d] bg-[#fff6f4]' : 'border-slate-200 bg-slate-50 hover:border-[#ff4d2d]'}`}
                >
                  <h3 className="text-base font-bold text-slate-900">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.key === 'add-listing' && 'Create a new listing and upload photos.'}
                    {item.key === 'my-listing' && 'See and manage your own listings only.'}
                    {item.key === 'bookings' && 'Review booking requests and status.'}
                    {item.key === 'pending-bookings' && 'Review pending booking requests before confirmation.'}
                    {item.key === 'confirmed-bookings' && 'Track your confirmed stays and plans.'}
                    {item.key === 'paid-bookings' && 'View paid bookings and completed payment-ready stays.'}
                    {item.key === 'earnings' && 'Track revenue by listing.'}
                    {item.key === 'messages' && 'Open your conversation area.'}
                    {item.key === 'users' && 'View active and inactive users.'}
                    {item.key === 'listings' && 'Browse all platform listings.'}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff4d2d]">Summary</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Simple stats</h2>
              </div>
              <FaChartBar className="text-[#ff4d2d]" aria-hidden="true" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {dashboardBars.map(bar => (
                <article key={bar.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-600">{bar.label}</span>
                    <span className="text-2xl font-black text-slate-900">{bar.value}</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${bar.color}`}
                      style={{ width: `${Math.max(15, Math.min(100, bar.value * 18))}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DashboardLinkCard title="Bookings" description="Open your booking details and history." action="View bookings" onClick={() => onViewBookings('all')} />
              <DashboardLinkCard title="Listings" description="Open listing details from the sidebar or browse page." action="Browse listings" onClick={onBrowseListings} />
            </div>
          </section>
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

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  )
}

function DashboardLinkCard({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-[#ff4d2d] hover:bg-[#fff6f4]">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <span className="mt-4 inline-flex rounded-full bg-[#ff4d2d] px-4 py-2 text-sm font-semibold text-white">{action}</span>
    </button>
  )
}

export default withAuth(DashboardPage)
