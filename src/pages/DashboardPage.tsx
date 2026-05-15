import Dashboard from '../features/auth/pages/DashboardPage'

export default function Page() {
  const navigate = (path: string) => {
    // simple navigation for the SPA; the app router will also handle these routes
    window.location.href = path
  }

  const toBookingsPath = (status?: 'all' | 'pending' | 'confirmed' | 'paid') => {
    if (!status || status === 'all') return '/bookings'
    return `/bookings?status=${status}`
  }

  return (
    <Dashboard
      onViewBookings={(status) => navigate(toBookingsPath(status))}
      onBrowseListings={() => navigate('/listings')}
      onCreateListing={() => navigate('/host/listings/new')}
      onEditListing={(id: string) => navigate(`/host/listings/${id}/edit`)}
      onOpenHostDashboard={() => navigate('/host/dashboard')}
      onGoModeration={() => navigate('/admin/moderation')}
      onGoAllBookings={() => navigate('/admin/bookings')}
    />
  )
}
