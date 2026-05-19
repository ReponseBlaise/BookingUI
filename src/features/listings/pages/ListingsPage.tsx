import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { FaListUl, FaThLarge, FaSearch, FaTimes } from 'react-icons/fa'
import { useStore } from '../../../store/StoreContext'
import { useAuth } from '../../auth'
import { useListings } from '../hooks/useListings'
import { useSavedListings } from '../hooks/useSavedListings'
import { ListingsSidebar } from '../components/ListingsSidebar'
import { List } from '../../../shared/components/List'
import { listingTypeLabel }
  from '../types'

import type { Listing } from '../types'
import { ListingCard } from '../components/ListingCard'

type ListingsPageProps = {
  onOpenListing: (id: string) => void
  onOpenBookingForm: (listing: Listing) => void
}

export function ListingsPage({ onOpenListing, onOpenBookingForm }: ListingsPageProps) {
  const { data: listings = [], isLoading, isError, isFetching, refetch } = useListings()
  const { data: savedListings = [] } = useSavedListings()
  const { user } = useAuth()
  const { state, dispatch } = useStore()
  const { filter } = state

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [minPrice, setMinPrice] = useState(50)
  const [maxPrice, setMaxPrice] = useState(500)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list')
  const [savedOnly, setSavedOnly] = useState(false)

  const categoryOptions = useMemo(() => {
    const counts: Record<string, number> = { All: listings.length }
    for (const l of listings) {
      counts[l.category] = (counts[l.category] || 0) + 1
    }
    return Object.keys(counts).map(key => ({
      label: key === 'All' ? 'All' : listingTypeLabel(key as Parameters<typeof listingTypeLabel>[0]),
      count: counts[key],
    }))
  }, [listings])

  const filteredListings = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return listings
      .filter(l => l.available)
      .filter(l => selectedCategory === 'All' || l.category === selectedCategory)
      .filter(l => l.price >= minPrice && l.price <= maxPrice)
      .filter(l => !savedOnly || (user ? savedListings : []).includes(l.id))
      .filter(l =>
        !q ||
        [l.title, l.location, l.category, l.description, ...l.tags]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .sort((a, b) => b.rating - a.rating)
  }, [listings, selectedCategory, minPrice, maxPrice, filter, savedListings, savedOnly, user])

  const clearFilters = () => {
    setSelectedCategory('All')
    setMinPrice(50)
    setMaxPrice(500)
    dispatch({ type: 'SET_FILTER', payload: '' })
  }

  if (isError) {
    return (
      <main className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7f4ef]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-900">Failed to load listings</p>
          <p className="mt-2 text-sm text-slate-500">Something went wrong. Please try again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#f7f4ef] pb-10 pt-4">
      <div className="mx-auto max-w-430 px-4 sm:px-6 lg:px-8">
        <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_auto_auto] lg:items-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <FaSearch className="text-slate-400" aria-hidden="true" />
            <input
              value={filter}
              onChange={event => dispatch({ type: 'SET_FILTER', payload: event.target.value })}
              placeholder="What are you looking for?"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {filter && (
              <button type="button" onClick={() => dispatch({ type: 'SET_FILTER', payload: '' })} className="text-slate-400 transition hover:text-slate-700" aria-label="Clear search">
                <FaTimes aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
            0.5 km
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
            All Categories
          </div>
          <div className="flex items-center gap-2 justify-start lg:justify-end">
            <p className="text-sm font-medium text-slate-600">
              {filteredListings.length.toLocaleString()} listing{filteredListings.length !== 1 ? 's' : ''} found
            </p>
            {isFetching && <span className="text-xs font-medium text-slate-400">Refreshing...</span>}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={clsx(
                  'grid h-9 w-9 place-items-center rounded-lg transition',
                  layoutMode === 'grid' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:bg-slate-100',
                )}
                aria-label="Grid view"
              >
                <FaThLarge aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={clsx(
                  'grid h-9 w-9 place-items-center rounded-lg transition',
                  layoutMode === 'list' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:bg-slate-100',
                )}
                aria-label="List view"
              >
                <FaListUl aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="order-2 min-w-0 rounded-[26px] bg-white/55 p-0 lg:order-2">
            {filteredListings.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-2xl font-bold text-slate-900">No listings matched your filters.</p>
                <p className="mt-2 text-sm text-slate-500">Try widening the price range or clearing the selected category.</p>
                <button type="button" onClick={clearFilters} className="mt-6 rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)]">
                  Clear filters
                </button>
              </div>
            ) : (
              <List<Listing>
                items={filteredListings}
                keyExtractor={listing => listing.id}
                className={layoutMode === 'grid' ? 'grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col gap-5'}
                renderItem={listing => (
                  <div className={layoutMode === 'list' ? 'max-w-3xl' : ''}>
                        <ListingCard
                          listing={listing}
                          variant="result"
                          onClick={() => onOpenListing(listing.id)}
                          onBook={user && listing.hostId !== user.id ? () => onOpenBookingForm(listing) : undefined}
                          compact={layoutMode === 'list'}
                        />
                  </div>
                )}
              />
            )}

            {isLoading && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ListingSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          <div className="order-1 lg:sticky lg:top-6 lg:h-fit">
            <ListingsSidebar
              categories={categoryOptions}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              onClearFilters={clearFilters}
            />
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              <button
                type="button"
                onClick={() => setSavedOnly(value => !value)}
                className={clsx(
                  'inline-flex items-center gap-2 font-semibold transition',
                  savedOnly ? 'text-[#ff4d2d]' : 'text-slate-700 hover:text-[#ff4d2d]',
                )}
              >
                Saved only
              </button>
              <span>{savedOnly ? 'On' : 'Off'}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function ListingSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  )
}
