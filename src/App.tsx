import './App.css'
import { useEffect, useState } from 'react'
import Navbar, { type View } from './shared/components/Navbar'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { HomePage, ListingsPage, ListingDetail } from './features/listings'
import { useAuth } from './features/auth'
import DashboardPage from './features/auth/pages/DashboardPage'
import { BookingForm, MyBookingsPage } from './features/bookings'
import { HostDashboard, CreateListingPage, EditListingPage } from './features/host'
import { AdminDashboard, ModerationQueue, AllBookingsPage, UsersPage } from './features/admin'
import type { Listing } from './features/listings'
import { AiChatWidget } from './shared/components/AiChatWidget'
import { SiteFooter } from './shared/components/SiteFooter'

type AppView =
  | { page: 'home' }
  | { page: 'listings' }
  | { page: 'explore' }
  | { page: 'login' }
  | { page: 'profile' }
  | { page: 'dashboard' }
  | { page: 'listing-detail'; id: string }
  | { page: 'booking'; listing: Listing }
  | { page: 'my-bookings'; status?: 'all' | 'pending' | 'confirmed' | 'paid' }
  | { page: 'host-dashboard'; initialTab?: 'listings' | 'bookings' }
  | { page: 'create-listing' }
  | { page: 'edit-listing'; id: string }
  | { page: 'admin-dashboard' }
  | { page: 'moderation-queue' }
  | { page: 'all-bookings' }
  | { page: 'admin-users' }

function toNavView(page: AppView['page']): View {
  const map: Partial<Record<AppView['page'], View>> = {
    home: 'home',
    listings: 'listings',
    login: 'login',
    dashboard: 'dashboard',
    'host-dashboard': 'dashboard',
    'admin-dashboard': 'dashboard',
  }
  return map[page] ?? 'home'
}

function App() {
  const [view, setView] = useState<AppView>({ page: 'home' })
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  })
  const { user } = useAuth()

  const nav = (v: AppView) => setView(v)

  // Use preferredRole as the source of truth — some APIs return GUEST as default role
  // but store the actual selected role in preferredRole
  const effectiveRole = user?.preferredRole ?? user?.role ?? 'GUEST'

  const activeNavView = toNavView(view.page)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view.page])

  useEffect(() => {
    if (!user || view.page !== 'login') return

    setView({ page: 'home' })
  }, [user, view.page])

  const handleNavNavigate = (navView: View) => {
    const map: Record<View, AppView> = {
      home: { page: 'home' },
      listings: { page: 'listings' },
      explore: { page: 'home' },
      login: { page: 'login' },
      dashboard: !user ? { page: 'login' } : { page: 'dashboard' },
    }
    setView(map[navView])
  }

  const handleLoginSuccess = (nextUser: { role: 'GUEST' | 'HOST' | 'ADMIN'; preferredRole?: 'GUEST' | 'HOST' | 'ADMIN' }) => {
    void nextUser
    nav({ page: 'home' })
  }

  return (
    <div className="page-shell">
      <Navbar 
        activeView={activeNavView} 
        onNavigate={handleNavNavigate}
        onAddListing={() => nav({ page: 'create-listing' })}
        onProfileClick={() => nav({ page: 'profile' })}
        theme={theme}
        onToggleTheme={() => setTheme(current => (current === 'light' ? 'dark' : 'light'))}
      />

      {view.page === 'home' && (
        <HomePage
          onBrowseListings={() => nav({ page: 'listings' })}
          onOpenListing={id => nav({ page: 'listing-detail', id })}
        />
      )}

      {view.page === 'listings' && (
        <ListingsPage
          onOpenListing={id => nav({ page: 'listing-detail', id })}
          onOpenBookingForm={listing => nav({ page: 'booking', listing })}
        />
      )}

      {view.page === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {view.page === 'profile' && user && (
        <ProfilePage />
      )}

      {view.page === 'dashboard' && user && (
        <DashboardPage
          onViewBookings={(status) => nav({ page: 'my-bookings', status })}
          onBrowseListings={() => nav({ page: 'listings' })}
          onOpenHostDashboard={(initialTab) => nav({ page: 'host-dashboard', initialTab })}
          onCreateListing={() => nav({ page: 'create-listing' })}
          onEditListing={id => nav({ page: 'edit-listing', id })}
          onGoModeration={() => nav({ page: 'moderation-queue' })}
          onGoAllBookings={() => nav({ page: 'all-bookings' })}
          onGoUsers={() => nav({ page: 'admin-users' })}
        />
      )}

      {view.page === 'listing-detail' && (
        <ListingDetail
          id={view.id}
          onBack={() => nav({ page: 'listings' })}
          onBooked={() => nav({ page: 'my-bookings', status: 'all' })}
          onRequireLogin={() => nav({ page: 'login' })}
          onOpenBookingForm={listing => nav({ page: 'booking', listing })}
        />
      )}

      {view.page === 'booking' && (
        <BookingForm
          listing={view.listing}
          onBack={() => nav({ page: 'listing-detail', id: view.listing.id })}
          onSuccess={() => nav({ page: 'my-bookings', status: 'all' })}
        />
      )}

      {view.page === 'my-bookings' && (
        user ? (
          <MyBookingsPage initialStatus={view.status ?? 'all'} onOpenListing={id => nav({ page: 'listing-detail', id })} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )
      )}

      {view.page === 'host-dashboard' && (
        user && effectiveRole === 'HOST' ? (
          <HostDashboard
            onCreateListing={() => nav({ page: 'create-listing' })}
            onEditListing={id => nav({ page: 'edit-listing', id })}
            initialTab={view.initialTab}
          />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )
      )}

      {view.page === 'create-listing' && (
        user && effectiveRole === 'HOST' ? (
          <CreateListingPage
            onBack={() => nav({ page: 'dashboard' })}
            onSuccess={() => nav({ page: 'dashboard' })}
          />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )
      )}

      {view.page === 'edit-listing' && (
        user && effectiveRole === 'HOST' ? (
          <EditListingPage
            id={view.id}
            onBack={() => nav({ page: 'dashboard' })}
            onSuccess={() => nav({ page: 'dashboard' })}
          />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )
      )}

      {view.page === 'admin-dashboard' && (
        user ? (
          <AdminDashboard
            onGoToModeration={() => nav({ page: 'moderation-queue' })}
            onGoToBookings={() => nav({ page: 'all-bookings' })}
          />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )
      )}

      {view.page === 'moderation-queue' && (
        user ? <ModerationQueue onBack={() => nav({ page: 'admin-dashboard' })} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {view.page === 'all-bookings' && (
        user ? <AllBookingsPage onBack={() => nav({ page: 'admin-dashboard' })} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {view.page === 'admin-users' && (
        user ? <UsersPage onBack={() => nav({ page: 'dashboard' })} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      <SiteFooter
        onBrowseListings={() => nav({ page: 'listings' })}
        onDashboard={() => nav({ page: 'dashboard' })}
      />

      <AiChatWidget
        role={effectiveRole}
        currentView={view.page}
        onBrowseListings={() => nav({ page: 'listings' })}
        onOpenDashboard={() => nav({ page: 'dashboard' })}
        onOpenBookings={() => nav({ page: 'my-bookings' })}
        onOpenHostDashboard={() => nav({ page: 'host-dashboard' })}
      />
    </div>
  )
}

export default App
