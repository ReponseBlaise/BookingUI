import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa'
import { usePendingListings } from '../hooks/usePendingListings'
import { useApprove } from '../hooks/useApprove'
import { useReject } from '../hooks/useReject'
import { Spinner } from '../../../shared/components/Spinner'
import type { Listing } from '../../listings/types'

type ModerationQueueProps = {
  onBack: () => void
}

export function ModerationQueue({ onBack }: ModerationQueueProps) {
  const { data: listings = [], isLoading, isError } = usePendingListings()
  const approve = useApprove()
  const reject = useReject()
  const [search, setSearch] = useState('')

  return (
    <main className="bg-[#f7f4ef] pb-12 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#ff4d2d]"
        >
          <FaArrowLeft aria-hidden="true" /> Back to admin
        </button>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Admin</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Moderation Queue</h1>
          <p className="mt-1 text-sm text-slate-500">{listings.length} listing{listings.length !== 1 ? 's' : ''} pending review</p>
        </div>

        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search pending listings by title or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#ff4d2d]"
          />
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load pending listings.</p>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-slate-700">No listings pending review.</p>
          </div>
        ) : (
          <div className="grid gap-5">
              {listings
                .filter(l => {
                  const q = search.trim().toLowerCase()
                  if (!q) return true
                  return (
                    (l.title ?? '').toLowerCase().includes(q) ||
                    (l.location ?? '').toLowerCase().includes(q) ||
                    (l.description ?? '').toLowerCase().includes(q)
                  )
                })
                .map((listing: Listing) => (
              <PendingListingCard
                key={listing.id}
                listing={listing}
                onApprove={() => approve.mutate(listing.id)}
                onReject={() => reject.mutate(listing.id)}
                isPending={approve.isPending || reject.isPending}
              />
                ))}
          </div>
        )}
      </div>
    </main>
  )
}

function PendingListingCard({ listing, onApprove, onReject, isPending }: {
  listing: Listing
  onApprove: () => void
  onReject: () => void
  isPending: boolean
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid sm:grid-cols-[200px_1fr]">
        {listing.img ? (
          <img src={listing.img} alt={listing.title} className="h-48 w-full object-cover sm:h-full" />
        ) : (
          <div className="h-48 w-full bg-slate-300 flex items-center justify-center sm:h-full">
            <span className="text-slate-500 text-sm">No image</span>
          </div>
        )}
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{listing.title}</h2>
              <p className="text-sm text-slate-500">{listing.location}</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">{listing.description}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="font-bold text-[#ff4d2d]">${listing.price}/night</span>
            {listing.superhost && <span className="text-emerald-600 font-semibold">Superhost</span>}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onApprove}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <FaCheck aria-hidden="true" /> Approve
            </button>
            <button
              type="button"
              onClick={onReject}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              <FaTimes aria-hidden="true" /> Reject
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
