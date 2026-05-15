import { useState } from 'react'
import { Transition } from '@headlessui/react'
import { FaHeart, FaTimes } from 'react-icons/fa'
import { useListings } from '../hooks/useListings'
import { useSavedListings } from '../hooks/useSavedListings'
import { useToggleSaved } from '../hooks/useToggleSaved'
import { useAuth } from '../../auth'

export function SavedListings() {
  const [open, setOpen] = useState(false)
  const { data: listings = [] } = useListings()
  const { data: savedListings = [] } = useSavedListings()
  const { user } = useAuth()

  const effectiveSavedListings = user ? savedListings : []
  const savedItems = listings.filter(listing => effectiveSavedListings.includes(listing.id))

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
        aria-label={`Saved listings (${effectiveSavedListings.length})`}
      >
        <FaHeart className="text-xl" aria-hidden="true" />
        {effectiveSavedListings.length > 0 && (
          <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff4d2d] px-1 text-[10px] font-bold text-white">
            {effectiveSavedListings.length}
          </span>
        )}
      </button>

      <Transition show={open} transition>
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />

        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition duration-300 ease-in-out data-closed:translate-x-full">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Saved listings ({effectiveSavedListings.length})</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100"
              aria-label="Close saved panel"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {savedItems.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-500">No saved listings yet.</p>
            ) : (
              <ul className="grid gap-4">
                {savedItems.map(listing => (
                  <SavedListingItem
                    key={listing.id}
                    listingId={listing.id}
                    title={listing.title}
                    img={listing.img}
                    location={listing.location}
                    price={listing.price}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </Transition>
    </>
  )
}

function SavedListingItem({ listingId, title, img, location, price }: { listingId: string; title: string; img: string; location: string; price: number }) {
  const toggleSave = useToggleSaved(listingId)

  return (
    <li className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <img src={img} alt={title} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 truncate text-sm text-slate-500">{location}</p>
        <p className="mt-1 text-sm font-bold text-[#ff4d2d]">${price} / night</p>
      </div>
      <button
        type="button"
        onClick={() => toggleSave.mutate()}
        className="shrink-0 text-slate-400 transition hover:text-[#ff4d2d]"
        aria-label={`Remove ${title}`}
      >
        <FaTimes aria-hidden="true" />
      </button>
    </li>
  )
}
