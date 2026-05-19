import { FaCompass, FaMapMarkedAlt, FaSearch, FaStar } from 'react-icons/fa'
import { useMemo, useState, type ReactNode } from 'react'
import { useListings } from '../hooks/useListings'
import { ListingCard } from '../components/ListingCard'
import { HeroPanel } from '../components/HeroPanel'
import { MapPreview } from '../../../shared/components/MapPreview'
import { listingTypeOptions } from '../types'

type HomePageProps = {
  onBrowseListings: () => void
  onOpenListing: (id: string) => void
}

export function HomePage({ onBrowseListings, onOpenListing }: HomePageProps) {
  const { data: listings = [] } = useListings()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistance, setSelectedDistance] = useState('5')
  const [selectedLocation, setSelectedLocation] = useState('All locations')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  const locationOptions = useMemo(() => {
    const locations = new Set(listings.map(listing => listing.location).filter(Boolean))
    return ['All locations', ...Array.from(locations).sort((left, right) => left.localeCompare(right))]
  }, [listings])

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const maxResultsByDistance: Record<string, number> = {
      '0.5': 3,
      '2': 6,
      '5': 9,
    }
    const maxResults = maxResultsByDistance[selectedDistance] ?? 9

    return listings
      .filter(listing => listing.available)
      .filter(listing => selectedLocation === 'All locations' || listing.location === selectedLocation)
      .filter(listing => selectedCategory === 'All Categories' || listing.category === selectedCategory)
      .filter(listing => {
        if (!q) return true

        return [listing.title, listing.location, listing.category, listing.description, ...listing.tags]
          .join(' ')
          .toLowerCase()
          .includes(q)
      })
      .slice(0, maxResults)
  }, [listings, searchQuery, selectedDistance, selectedLocation, selectedCategory])

  const featuredListings = filteredListings.slice(0, 3)
  const exploreHighlights = filteredListings.slice(0, 6)
  const mapHighlight = filteredListings[0] ?? listings[0]

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDistance('5')
    setSelectedLocation('All locations')
    setSelectedCategory('All Categories')
  }

  return (
    <main className="space-y-10 pb-12">
      <section className="relative z-10 mx-auto -mb-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_240px_240px_190px]">
            <label className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 lg:border-b-0 lg:border-r">
              <FaSearch className="text-lg text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={selectedDistance}
              onChange={event => setSelectedDistance(event.target.value)}
              className="border-b border-slate-200 bg-transparent px-5 py-4 text-sm font-medium text-slate-700 outline-none lg:border-b-0 lg:border-r"
            >
              <option value="0.5">0.5 km</option>
              <option value="2">2 km</option>
              <option value="5">5 km</option>
            </select>

            <select
              value={selectedLocation}
              onChange={event => setSelectedLocation(event.target.value)}
              className="border-b border-slate-200 bg-transparent px-5 py-4 text-sm font-medium text-slate-700 outline-none lg:border-b-0 lg:border-r"
            >
              {locationOptions.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={event => setSelectedCategory(event.target.value)}
              className="bg-transparent px-5 py-4 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="All Categories">All Categories</option>
              {listingTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <HeroPanel onBrowseListings={onBrowseListings} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff4d2d]">Featured stays</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">Popular homes chosen for the first release</h2>
            <p className="mt-2 text-sm text-slate-500">Showing {filteredListings.length} matching stay{filteredListings.length === 1 ? '' : 's'}.</p>
          </div>
          <button type="button" onClick={onBrowseListings} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#ff4d2d] hover:text-[#ff4d2d]">
            See all listings
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featuredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} onClick={() => onOpenListing(listing.id)} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-4xl bg-linear-to-r from-[#1f2530] to-[#2f3644] p-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Explore inside Home</p>
              <h2 className="mt-3 text-3xl font-black tracking-tighter sm:text-4xl">Discover stays by place without leaving home page.</h2>
              <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                Browse featured destinations and map preview directly on the home screen. Use the controls above to narrow the list.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatBadge icon={<FaCompass />} label="Destinations" value={String(exploreHighlights.length || 0)} />
              <StatBadge icon={<FaMapMarkedAlt />} label="Map preview" value={mapHighlight?.location ? 'Live' : 'Ready'} />
              <StatBadge icon={<FaStar />} label="Top rated" value={mapHighlight ? mapHighlight.rating.toFixed(1) : '4.9'} />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/80 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <span>Current filters: {searchQuery || 'any stay'}, {selectedLocation}, {selectedCategory}, {selectedDistance} km</span>
            <button type="button" onClick={clearFilters} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10">
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff4d2d]">Featured destinations</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Where people are staying now</h3>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {exploreHighlights.map(listing => (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => onOpenListing(listing.id)}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#ff4d2d]"
                >
                  <p className="text-sm font-semibold text-slate-900">{listing.location}</p>
                  <p className="mt-2 text-sm text-slate-500">{listing.title}</p>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>${listing.price} / night</span>
                    <span>{listing.rating.toFixed(1)} rating</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <MapPreview
            title={mapHighlight?.location ? `${mapHighlight.location} on the map` : 'Destination preview'}
            location={mapHighlight?.location ?? 'Barcelona, Spain'}
            height={440}
          />
        </div>
      </section>
    </main>
  )
}

function StatBadge({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-white/75">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.3em]">{label}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </article>
  )
}
