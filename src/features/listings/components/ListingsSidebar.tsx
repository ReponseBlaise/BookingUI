import clsx from 'clsx'
import { FaRedoAlt } from 'react-icons/fa'
import type { ChangeEvent } from 'react'
import { listingTypeLabel }
  from '../types'

type ListingsSidebarProps = {
  categories: Array<{
    label: string
    count: number
  }>
  selectedCategory: string
  onCategoryChange: (category: string) => void
  minPrice: number
  maxPrice: number
  onMinPriceChange: (value: number) => void
  onMaxPriceChange: (value: number) => void
  onClearFilters: () => void
}

export function ListingsSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
}: ListingsSidebarProps) {
  return (
    <aside className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:p-6">
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Price Filter</h3>
        <p className="mt-1 text-sm text-slate-500">Select min and max price range</p>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-700">
            <span className="rounded-md bg-[#1f2530] px-2.5 py-1 text-white">${minPrice.toLocaleString()}</span>
            <span className="rounded-md bg-[#1f2530] px-2.5 py-1 text-white">${Math.round((minPrice + maxPrice) / 2).toLocaleString()}</span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-600">${maxPrice.toLocaleString()}</span>
          </div>

          <div className="relative h-10">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#ff4d2d]"
              style={{ left: `${((minPrice - 50) / 450) * 100}%`, right: `${100 - ((maxPrice - 50) / 450) * 100}%` }}
            />
            <input
              type="range"
              min={50}
              max={500}
              step={5}
              value={minPrice}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onMinPriceChange(Math.min(Number(event.target.value), maxPrice - 5))}
              className="range-thumb absolute inset-x-0 top-0 z-20 h-10 w-full appearance-none bg-transparent"
            />
            <input
              type="range"
              min={50}
              max={500}
              step={5}
              value={maxPrice}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onMaxPriceChange(Math.max(Number(event.target.value), minPrice + 5))}
              className="range-thumb absolute inset-x-0 top-0 z-10 h-10 w-full appearance-none bg-transparent"
            />
            <span className="pointer-events-none absolute top-1/2 z-30 flex h-5 w-5 -translate-y-1/2 rounded-full border-2 border-[#ff4d2d] bg-white shadow-sm" style={{ left: `calc(${((minPrice - 50) / 450) * 100}% - 10px)` }} />
            <span className="pointer-events-none absolute top-1/2 z-30 flex h-5 w-5 -translate-y-1/2 rounded-full border-2 border-[#ff4d2d] bg-white shadow-sm" style={{ left: `calc(${((maxPrice - 50) / 450) * 100}% - 10px)` }} />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Categories</h3>
        <p className="mt-1 text-sm text-slate-500">Pick one category at a time.</p>

        <div className="mt-4 space-y-2">
          {categories.map(category => {
            const active = selectedCategory === category.label
            return (
              <button
                key={category.label}
                type="button"
                onClick={() => onCategoryChange(category.label)}
                className={clsx(
                  'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition',
                  active ? 'border-[#ff4d2d] bg-[#ff4d2d]/6 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={clsx('h-4 w-4 rounded border', active ? 'border-[#ff4d2d] bg-[#ff4d2d]' : 'border-slate-300 bg-white')} />
                  <span>{category.label === 'All' ? 'All' : listingTypeLabel(category.label as Parameters<typeof listingTypeLabel>[0])}</span>
                </span>
                <span className="text-xs font-medium text-slate-500">({category.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Order by</h3>
        <p className="mt-1 text-sm text-slate-500">Choose how listings are sorted.</p>
        <select className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/15">
          <option>Latest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Top Rated</option>
        </select>
      </div>

      <button type="button" className="mt-8 w-full rounded-2xl bg-[#ff4d2d] px-4 py-4 text-base font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)] transition hover:bg-[#ff5b3f]">
        Apply filters
      </button>
      <button type="button" onClick={onClearFilters} className="mt-3 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        <FaRedoAlt aria-hidden="true" className="text-xs" />
        Clear filters
      </button>
    </aside>
  )
}
