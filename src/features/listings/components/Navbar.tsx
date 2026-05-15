import { useState } from 'react'
import { FaBars, FaHeart, FaMoon, FaPlusCircle, FaSignInAlt } from 'react-icons/fa'
import clsx from 'clsx'

type View = 'home' | 'dashboard' | 'listings' | 'explore' | 'login'

type NavbarProps = {
  activeView: View
  onNavigate: (view: View) => void
}

const navLinks: Array<{ label: string; view: View }> = [
  { label: 'Home', view: 'home' },
  { label: 'Dashboard', view: 'dashboard' },
  { label: 'Listings', view: 'listings' },
  { label: 'Explore', view: 'explore' },
]

export default function Navbar({ activeView, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavigate = (view: View) => {
    onNavigate(view)
    setMenuOpen(false)
  }

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
          <button type="button" className="icon-btn" aria-label="Favorites">
            <FaHeart aria-hidden="true" />
            <span className="badge">5</span>
          </button>
          <span className="tooltip">Favorites</span>
        </div>
        <div className="icon-with-tooltip">
          <button type="button" className="icon-btn" aria-label="Theme toggle">
            <FaMoon aria-hidden="true" />
          </button>
          <span className="tooltip">Dark Mode</span>
        </div>

        <div className="icon-with-tooltip">
          <button type="button" className="icon-btn" aria-label="Login" onClick={() => handleNavigate('login')}>
            <FaSignInAlt aria-hidden="true" />
          </button>
          <span className="tooltip">Login</span>
        </div>

        <button type="button" className="cta-btn" aria-disabled="true">
          <FaPlusCircle aria-hidden="true" />
          <span>Add Listing</span>
        </button>
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
      </nav>
    </header>
  )
}
