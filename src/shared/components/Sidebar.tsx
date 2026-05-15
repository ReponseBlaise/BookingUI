import { useState } from 'react'
import { FaUsers, FaHome, FaList, FaClipboardList, FaPlus, FaSignOutAlt } from 'react-icons/fa'
import clsx from 'clsx'
import { useAuth } from '../../features/auth'

export type MenuKey =
  | 'overview'
  | 'profile'
  | 'bookings'
  | 'listings'
  | 'new-listing'
  | 'messages'
  | 'admin-users'
  | 'admin-reports'
  | 'wallet'
  | 'bookmark'
  | 'reviews'

type SidebarProps = {
  active: MenuKey
  onSelect: (key: MenuKey) => void
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  const { user, logout } = useAuth()
  const effectiveRole = user?.preferredRole ?? user?.role ?? 'GUEST'
  const [collapsed] = useState(false)

  const common = [
    { key: 'overview' as MenuKey, label: 'Dashboard', icon: <FaHome /> },
    { key: 'new-listing' as MenuKey, label: 'Add Listing', icon: <FaPlus /> },
    { key: 'wallet' as MenuKey, label: 'Wallet', icon: <FaClipboardList /> },
    { key: 'messages' as MenuKey, label: 'Messages', icon: <FaClipboardList /> },
  ]

  const guestExtra = [{ key: 'bookings' as MenuKey, label: 'My bookings', icon: <FaClipboardList /> }]

  const hostExtra = [
    { key: 'listings' as MenuKey, label: 'My listings', icon: <FaList /> },
    { key: 'reviews' as MenuKey, label: 'Reviews', icon: <FaList /> },
    { key: 'bookings' as MenuKey, label: 'Bookings', icon: <FaClipboardList /> },
    { key: 'bookmark' as MenuKey, label: 'Bookmark', icon: <FaList /> },
  ]

  const adminExtra = [
    { key: 'admin-users' as MenuKey, label: 'Users', icon: <FaUsers /> },
    { key: 'admin-reports' as MenuKey, label: 'Reports', icon: <FaClipboardList /> },
  ]

  let items = [...common]
  if (effectiveRole === 'GUEST') items = items.concat(guestExtra)
  if (effectiveRole === 'HOST') items = items.concat(hostExtra)
  if (effectiveRole === 'ADMIN') items = items.concat(adminExtra)

  return (
    <aside className={clsx('w-64 shrink-0')} aria-label="Sidebar">
      <div className="sticky top-6 space-y-4">
        <div className="px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100" />
            <div>
              <div className="text-sm font-semibold text-slate-900">{user?.name ?? 'Guest'}</div>
              <div className="text-xs text-slate-500">{effectiveRole}</div>
            </div>
          </div>
        </div>

        <nav className="px-2">
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onSelect(item.key)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition',
                    active === item.key ? 'bg-[#ff4d2d] text-white' : 'text-slate-700 hover:bg-slate-100',
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className={collapsed ? 'hidden' : ''}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3">
          <button
            type="button"
            onClick={() => logout()}
            className="mt-4 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
