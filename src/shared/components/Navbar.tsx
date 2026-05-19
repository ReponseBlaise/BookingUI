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
  isAdmin?: boolean
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const navLinks: Array<{ label: string; view: View }> = [
  { label: 'Home', view: 'home' },
  { label: 'Dashboard', view: 'dashboard' },
  { label: 'Listings', view: 'listings' },
]

export default function Navbar({ activeView, onNavigate, onAddListing, onProfileClick, isAdmin = false, theme, onToggleTheme }: NavbarProps) {
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
  const adminLinks = [{ label: 'Dashboard', view: 'dashboard' as View }]
  const visibleNavLinks = isAdmin ? adminLinks : navLinks
  const openProfile = () => {
    if (onProfileClick) {
      onProfileClick()
      setMenuOpen(false)
      return
    }
    handleNavigate('login')
  }

  return (
    <header className="top-nav" aria-label="Primary">
      <div className="brand" aria-label="Hafi Props home">
        <span className="brand-main">Hafi </span>
        <span className="brand-accent">Properties</span>
      </div>

      <nav className="main-links desktop-links" aria-label="Main menu">
        {visibleNavLinks.map(item => (
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
        {!isAdmin && (
          <div className="icon-with-tooltip">
            <SavedListings />
            <span className="tooltip">Favorites</span>
          </div>
        )}
        <div className="icon-with-tooltip theme-action">
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
            {!isAdmin && onProfileClick && (
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
            {!isAdmin && isHost && onAddListing && (
              <div className="icon-with-tooltip">
                <button
                  type="button"
                  className="cta-btn cta-btn--compact"
                  aria-label="Add listing"
                  onClick={onAddListing}
                  title="Add listing"
                >
                  <FaPlusCircle aria-hidden="true" />
                  <span>Add listing</span>
                </button>
                <span className="tooltip">Add listing</span>
              </div>
            )}
            <div className="icon-with-tooltip">
              <button type="button" className="icon-btn" aria-label="Logout" onClick={handleLogout}>
                <FaSignOutAlt aria-hidden="true" />
              </button>
              <span className="tooltip">Logout ({user.name})</span>
            </div>
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
        {visibleNavLinks.map(item => (
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

      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {isAdmin ? (
          <>
            <button type="button" className={clsx('mobile-bottom-nav__item', activeView === 'dashboard' && 'active')} onClick={() => handleNavigate('dashboard')}>
              <span>Dashboard</span>
            </button>
            {user && (
              <button type="button" className="mobile-bottom-nav__item" onClick={handleLogout}>
                <span>Logout</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button type="button" className={clsx('mobile-bottom-nav__item', activeView === 'home' && 'active')} onClick={() => handleNavigate('home')}>
              <span>Home</span>
            </button>
            <button type="button" className={clsx('mobile-bottom-nav__item', activeView === 'listings' && 'active')} onClick={() => handleNavigate('listings')}>
              <span>Search</span>
            </button>
            <button type="button" className={clsx('mobile-bottom-nav__item', activeView === 'dashboard' && 'active')} onClick={() => handleNavigate('dashboard')}>
              <span>Trips</span>
            </button>
            <button type="button" className={clsx('mobile-bottom-nav__item', onProfileClick && 'mobile-bottom-nav__item--profile')} onClick={openProfile}>
              <span>{user ? 'Profile' : 'Login'}</span>
            </button>
            {isHost && onAddListing && (
              <button type="button" className="mobile-bottom-nav__item mobile-bottom-nav__item--cta" onClick={onAddListing}>
                <span>Host</span>
              </button>
            )}
            {user && (
              <button type="button" className="mobile-bottom-nav__item" onClick={handleLogout}>
                <span>Logout</span>
              </button>
            )}
          </>
        )}
      </nav>
    </header>
  )
}
