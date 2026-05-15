import { useState } from 'react'
import { FaBars, FaMoon, FaPlus, FaPlusCircle, FaSignOutAlt, FaSun, FaUser } from 'react-icons/fa'
import clsx from 'clsx'
import { SavedListings } from '../../features/listings/components/SavedListings'
import { useAuth } from '../../features/auth'

export type View = 'home' | 'dashboard' | 'listings' | 'explore' | 'login'

type NavbarProps = {
  activeView: View
  onNavigate: (view: View) => void
  onAddListing?: () => void
  onProfileClick?: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const navLinks: Array<{ label: string; view: View }> = [
  { label: 'Home', view: 'home' },
  { label: 'Dashboard', view: 'dashboard' },
  { label: 'Listings', view: 'listings' },
]

export default function Navbar({ activeView, onNavigate, onAddListing, onProfileClick, theme, onToggleTheme }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleNavigate = (view: View) => {
    onNavigate(view)
    setMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    handleNavigate('home')
  }

  const effectiveRole = user?.preferredRole ?? user?.role ?? 'GUEST'
  const isHost = effectiveRole === 'HOST'

  return (
    <header className="top-nav" aria-label="Primary">
      <div className="brand" aria-label="Hafi Props home">
        <span className="brand-main">Hafi </span>
        <span className="brand-accent">Properties</span>
      </div>

      <nav className="main-links desktop-links" aria-label="Main menu">
        {navLinks.map(item => (
          <button
            key={item.label}
            type="button"
            className={clsx('link', activeView === item.view && 'active')}
            onClick={() => handleNavigate(item.view)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button type="button" className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
        <FaBars aria-hidden="true" />
      </button>

      <div className="nav-actions" aria-label="User actions">
        <div className="icon-with-tooltip">
          <SavedListings />
          <span className="tooltip">Favorites</span>
        </div>
        <div className="icon-with-tooltip">
          <button type="button" className="icon-btn" aria-label="Theme toggle" onClick={onToggleTheme}>
            {theme === 'dark' ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
          </button>
          <span className="tooltip">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </div>

        {user ? (
          <>
            <div className="icon-with-tooltip">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {effectiveRole}
              </span>
              <span className="tooltip">Logged in as {effectiveRole}</span>
            </div>
            {onProfileClick && (
              <div className="icon-with-tooltip">
                <button
                  type="button"
                  className="icon-btn icon-btn--small"
                  aria-label="View Profile"
                  onClick={onProfileClick}
                  title="View Profile"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="nav-avatar nav-avatar--image" />
                  ) : (
                    <div className="nav-avatar">
                      {user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                </button>
                <span className="tooltip">View Profile</span>
              </div>
            )}
            <div className="icon-with-tooltip">
              <button type="button" className="icon-btn" aria-label="Logout" onClick={handleLogout}>
                <FaSignOutAlt aria-hidden="true" />
              </button>
              <span className="tooltip">Logout ({user.name})</span>
            </div>
            {isHost && onAddListing && (
              <button type="button" className="cta-btn cta-btn--compact" onClick={onAddListing}>
                <FaPlusCircle aria-hidden="true" />
                <span>Add listing</span>
              </button>
            )}
          </>
        ) : (
          <div className="icon-with-tooltip">
              <button type="button" className="icon-btn icon-btn--small login-icon-btn" aria-label="Login" onClick={() => handleNavigate('login')}>
              <span className="login-glyph" aria-hidden="true">
                <FaUser />
                <FaPlus className="login-glyph-plus" />
              </span>
            </button>
            <span className="tooltip">Login</span>
          </div>
        )}
      </div>

      <nav className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-label="Mobile menu">
        {navLinks.map(item => (
          <button
            key={item.label}
            type="button"
            className={clsx('link', activeView === item.view && 'active')}
            onClick={() => handleNavigate(item.view)}
          >
            {item.label}
          </button>
        ))}
        {isHost && onAddListing && (
          <button type="button" className="mobile-add-listing" onClick={onAddListing}>
            <FaPlusCircle aria-hidden="true" />
            Add listing
          </button>
        )}
      </nav>
    </header>
  )
}
