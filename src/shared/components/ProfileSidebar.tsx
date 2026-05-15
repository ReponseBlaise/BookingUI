import {
  FaTachometerAlt,
  FaPlus,
  FaWallet,
  FaEnvelope,
  FaList,
  FaStar,
  FaCalendarAlt,
  FaBookmark,
  FaChevronDown,
  FaSignOutAlt,
} from 'react-icons/fa'
import { useAuth } from '../../features/auth'

type MenuAction =
  | 'dashboard'
  | 'add-listing'
  | 'wallet'
  | 'messages'
  | 'my-listing'
  | 'reviews'
  | 'bookings'
  | 'bookmark'
  | 'logout'

type ProfileSidebarProps = {
  onAction?: (action: MenuAction) => void
}

export default function ProfileSidebar({ onAction }: ProfileSidebarProps) {
  const { user, logout } = useAuth()

  const handle = (a: MenuAction) => {
    if (a === 'logout') return void logout()
    onAction?.(a)
  }

  return (
    <aside className="w-64 shrink-0" aria-label="Left sidebar">
      <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="px-3 py-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff4d2d] to-[#ff6b4d] flex items-center justify-center text-white font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{user?.name ?? 'User'}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email ?? 'example@gmail.com'}</div>
            </div>
          </div>
        </div>

        <nav className="px-2">
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => handle('dashboard')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handle('add-listing')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaPlus />
                <span>Add Listing</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handle('wallet')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaWallet />
                <span>Wallet</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handle('messages')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaEnvelope />
                <span>Messages</span>
                <span className="ml-auto inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">2</span>
              </button>
            </li>

            <li className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">Listings</li>

            <li>
              <button
                type="button"
                onClick={() => handle('my-listing')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaList />
                <span>My Listing</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handle('reviews')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaStar />
                <span>Reviews</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handle('bookings')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaCalendarAlt />
                <span>Bookings</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handle('bookmark')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaBookmark />
                <span>Bookmark</span>
              </button>
            </li>

            <li className="mt-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaChevronDown />
                <span>More</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handle('logout')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
