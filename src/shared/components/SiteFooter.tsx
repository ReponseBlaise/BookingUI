import { FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'

type SiteFooterProps = {
  onBrowseListings: () => void
  onDashboard: () => void
  isAdmin?: boolean
}

export function SiteFooter({ onBrowseListings, onDashboard, isAdmin = false }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div>
        <p className="site-footer__eyebrow">Hafi Properties</p>
        <h2 className="site-footer__title">Stay beautifully, host confidently.</h2>
        <p className="site-footer__copy">
          A compact Airbnb-style booking shell with guest, host, and admin flows connected to the backend.
        </p>
      </div>

      <div className="site-footer__links">
        {!isAdmin && <button type="button" onClick={onBrowseListings}>Browse listings</button>}
        <button type="button" onClick={onDashboard}>Dashboard</button>
      </div>

      <div className="site-footer__socials" aria-label="Social links">
        <button type="button" aria-label="Instagram"><FaInstagram /></button>
        <button type="button" aria-label="Twitter"><FaTwitter /></button>
        <button type="button" aria-label="YouTube"><FaYoutube /></button>
      </div>
    </footer>
  )
}
