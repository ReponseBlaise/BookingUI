import { useState } from 'react'
import { FaArrowLeft, FaUsers, FaHome, FaClipboardList } from 'react-icons/fa'
import { useUsers } from '../hooks/useUsers'
import { useBanUser } from '../hooks/useBanUser'
import { Spinner } from '../../../shared/components/Spinner'

type UsersPageProps = {
  onBack: () => void
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-[#ff4d2d]/10 text-[#ff4d2d]',
  HOST: 'bg-emerald-100 text-emerald-700',
  GUEST: 'bg-blue-100 text-blue-700',
}

const roleSummaryIcons: Record<string, React.ReactNode> = {
  ADMIN: <FaUsers />,
  HOST: <FaHome />,
  GUEST: <FaClipboardList />,
}

type RoleFilter = 'all' | 'ADMIN' | 'HOST' | 'GUEST'

export function UsersPage({ onBack }: UsersPageProps) {
  const { data: users = [], isLoading, isError } = useUsers()
  const banUser = useBanUser()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [banTargetId, setBanTargetId] = useState<string | null>(null)

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  const handleBan = (id: string) => {
    banUser.mutate(id)
    setBanTargetId(null)
  }

  return (
    <main className="bg-[#f7f4ef] pb-12 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Admin</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Users</h1>
          </div>
        </div>

        {/* Summary cards */}
        {!isLoading && !isError && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {(['ADMIN', 'HOST', 'GUEST'] as const).map(r => (
              <article
                key={r}
                className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
                onClick={() => setRoleFilter(current => (current === r ? 'all' : r))}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${roleColors[r]}`}
                >
                  {roleSummaryIcons[r]}
                </div>
                <div>
                  <p className="text-sm text-slate-500">{r}</p>
                  <p className="text-2xl font-black text-slate-900">
                    {users.filter(u => u.role === r).length}
                  </p>
                </div>
                {roleFilter === r && (
                  <span className="ml-auto rounded-full bg-[#ff4d2d] px-2 py-0.5 text-xs font-semibold text-white">
                    Filtered
                  </span>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name, email or username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-w-48 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/20"
          />
          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
            {(['all', 'ADMIN', 'HOST', 'GUEST'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2.5 text-sm font-semibold transition ${
                  roleFilter === r ? 'bg-[#ff4d2d] text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
            Failed to load users. Please try again.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-3">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700">{users.length}</span> users
              </p>
            </div>
            {filtered.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-500">No users match your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">
                      <th className="px-6 py-3 font-semibold text-slate-600">User</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Listings</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Joined</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(user => (
                      <tr key={user.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4d2d] to-[#ffb020] text-sm font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{user.name}</p>
                              <p className="truncate text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleColors[user.role] ?? 'bg-slate-100 text-slate-600'}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{user._count?.listings ?? 0}</td>
                        <td className="px-4 py-4 text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-4">
                          {banTargetId === user.id ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleBan(user.id)}
                                disabled={banUser.isPending}
                                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 hover:bg-red-700"
                              >
                                {banUser.isPending ? '…' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setBanTargetId(null)}
                                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBanTargetId(user.id)}
                              className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
                            >
                              Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
