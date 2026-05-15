type HeroPanelProps = {
  onBrowseListings: () => void
}

const heroImages = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
]

export function HeroPanel({ onBrowseListings }: HeroPanelProps) {
  return (
    <section className="relative isolate overflow-hidden px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-350">
        <div className="grid min-h-190 grid-cols-2 gap-2 rounded-4xl bg-slate-200 p-2 sm:grid-cols-3 lg:grid-cols-4">
          {heroImages.map((image, index) => (
            <div key={image + index} className="overflow-hidden rounded-3xl">
              <img src={image} alt="Beautiful property preview" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-4 top-1/2 mx-auto flex max-w-280 -translate-y-1/2 flex-col items-center rounded-4xl bg-slate-950/70 px-5 py-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-md sm:px-10 sm:py-14 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Find your next stay</p>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[1.04] tracking-tighter text-white sm:text-5xl lg:text-7xl">
            Just input your location &amp; find <span className="font-[cursive] text-[#ffb4a5]">important</span> &amp; exciting spots
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-white/80 sm:text-base">
            A clean Airbnb-style foundation for browsing stays, saving favorites, and filtering quickly.
          </p>

          <button
            type="button"
            onClick={onBrowseListings}
            className="pointer-events-auto mt-8 rounded-full bg-[#ff4d2d] px-8 py-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(255,77,45,0.26)] transition hover:bg-[#ff5b3f]"
          >
            Browse listings
          </button>
        </div>
      </div>
    </section>
  )
}
