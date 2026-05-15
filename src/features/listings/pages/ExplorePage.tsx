import { FaCompass, FaMapMarkedAlt, FaStar } from 'react-icons/fa'
import type { ReactNode } from 'react'
import { useListings } from '../hooks/useListings'
import { MapPreview } from '../../../shared/components/MapPreview'

export function ExplorePage() {
  const { data: listings = [] } = useListings()
  const featured = listings.slice(0, 6)
  const highlight = listings[0]

  return (
    <main className="bg-[#f6f5f1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-4xl bg-linear-to-r from-[#1f2530] to-[#2f3644] p-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Explore</p>
              <h1 className="mt-3 text-4xl font-black tracking-tighter sm:text-5xl">Discover stays by place, not just by price.</h1>
              <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                Browse destinations, open map previews, and jump straight into a home that matches the trip you have in mind.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatBadge icon={<FaCompass />} label="Destinations" value={String(featured.length || 0)} />
              <StatBadge icon={<FaMapMarkedAlt />} label="Map preview" value={highlight?.location ? 'Live' : 'Ready'} />
              <StatBadge icon={<FaStar />} label="Top rated" value={highlight ? highlight.rating.toFixed(1) : '4.9'} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff4d2d]">Featured destinations</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Where people are staying right now</h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {featured.map(listing => (
                  <article key={listing.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{listing.location}</p>
                    <p className="mt-2 text-sm text-slate-500">{listing.title}</p>
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>${listing.price} / night</span>
                      <span>{listing.rating.toFixed(1)} rating</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff4d2d]">Travel prompts</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Beach escape', 'City skyline', 'Cabin retreat', 'Work-ready stays', 'Family trip', 'Long weekend'].map(label => (
                  <span key={label} className="rounded-full bg-[#fff1eb] px-4 py-2 text-sm font-semibold text-[#b53a23]">{label}</span>
                ))}
              </div>
            </div>
          </div>

          <MapPreview
            title={highlight?.location ? `${highlight.location} on the map` : 'Destination preview'}
            location={highlight?.location ?? 'Barcelona, Spain'}
            height={560}
          />
        </section>
      </div>
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
