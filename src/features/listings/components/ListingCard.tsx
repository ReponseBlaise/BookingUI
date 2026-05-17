import { memo, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { FaHeart, FaStar } from 'react-icons/fa'
import clsx from 'clsx'
import type { Listing } from '../types'
import { listingTypeLabel } from '../types'
import { useSavedListings } from '../hooks/useSavedListings'
import { useToggleSaved } from '../hooks/useToggleSaved'
import styles from './ListingCard.module.css'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

type ListingCardProps = {
  listing: Listing
  onToggleSave?: () => void
  onClick?: () => void
  onBook?: () => void
  variant?: 'featured' | 'result'
  compact?: boolean
}

function ListingCardBase({
  listing,
  onToggleSave = () => {},
  onClick,
  onBook,
  variant = 'featured',
  compact = false,
}: ListingCardProps) {
  const { data: savedListings = [] } = useSavedListings()
  const toggleSave = useToggleSaved(listing.id)
  const savedState = savedListings.includes(listing.id)
  const image = listing.photoUrls?.[0] || listing.img || listing.image

  const handleToggleSave = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    toggleSave.mutate()
    onToggleSave()
  }

  const content = (
    <>
      {compact ? (
        // Horizontal layout for list view
        <div className="flex gap-3 sm:gap-4">
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg sm:h-40 sm:w-40">
            {image ? (
              <img src={image} alt={listing.title} className={clsx('h-full w-full object-cover', styles.image)} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200">
                <span className="text-xs text-slate-500">No image</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleToggleSave}
              className={clsx(
                'absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white text-slate-500 shadow-sm transition hover:text-[#ff4d2d]',
                savedState && 'text-[#ff4d2d]',
              )}
              aria-label={savedState ? `Unsave ${listing.title}` : `Save ${listing.title}`}
              aria-pressed={savedState}
            >
              <FaHeart aria-hidden="true" className="text-sm" />
            </button>
          </div>
          <div className="flex flex-1 flex-col justify-between py-1">
            <div>
              <p className="flex items-center gap-1 text-xs font-semibold text-[#ff4d2d]">
                <FaStar aria-hidden="true" />
                <span>({listing.rating.toFixed(1)}) {listing.reviewCount}</span>
              </p>
              <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900 sm:text-base">
                {listing.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-slate-600 sm:text-sm">
                {listing.location}
              </p>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {listing.guests}g
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {listing.beds}b
                </span>
              </div>
              <span className="shrink-0 rounded-full bg-[#ff4d2d]/10 px-2 py-0.5 text-xs font-semibold text-[#ff4d2d]">
                {currency.format(listing.price)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Vertical layout for grid view
        <>
          <div className="relative overflow-hidden">
            <div className={clsx('relative overflow-hidden', variant === 'result' ? 'aspect-4/3' : 'aspect-4/3')}>
              {image ? (
                <img src={image} alt={listing.title} className={clsx('h-full w-full object-cover', styles.image)} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200">
                  <span className="text-sm text-slate-500">No image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.03)_0%,rgba(15,23,42,0.08)_40%,rgba(15,23,42,0.34)_100%)]" />

              <div className="absolute left-3 top-3 rounded-full bg-slate-950/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                {listing.superhost ? 'Superhost' : 'Featured'}
              </div>

              <button
                type="button"
                onClick={handleToggleSave}
                className={clsx(
                  'absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white text-slate-500 shadow-sm transition hover:text-[#ff4d2d]',
                  savedState && 'text-[#ff4d2d]',
                )}
                aria-label={savedState ? `Unsave ${listing.title}` : `Save ${listing.title}`}
                aria-pressed={savedState}
              >
                <FaHeart aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={clsx('flex flex-1 flex-col', 'p-4 sm:p-5')}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-xs font-semibold text-[#ff4d2d] sm:text-sm">
                  <FaStar aria-hidden="true" />
                  <span>
                    ({listing.rating.toFixed(1)}) {listing.reviewCount.toLocaleString()} reviews
                  </span>
                </p>
                <h3 className={clsx('mt-2 font-semibold tracking-[-0.03em] text-slate-900', 'text-lg sm:text-xl')}>
                  {listing.title}
                </h3>
              </div>
              <span className="shrink-0 rounded-full bg-[#ff4d2d]/10 px-2.5 py-1 text-xs font-semibold text-[#ff4d2d]">
                {currency.format(listing.price)}
              </span>
            </div>

            <p className={clsx('mt-3 text-sm leading-6 text-slate-600', 'line-clamp-2')}>
              {listing.description || 'A comfortable stay with thoughtful details and an easy booking experience.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                {listing.location}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                {listingTypeLabel(listing.category)}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                {listing.guests} guest{listing.guests !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                {listing.beds} bed{listing.beds !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={event => {
                  event.stopPropagation()
                  onClick?.()
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#ff4d2d] hover:text-[#ff4d2d]"
              >
                View details
              </button>
              {onBook && (
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation()
                    onBook()
                  }}
                  className="rounded-full bg-[#ff4d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff5b3f]"
                >
                  Book now
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )

  return (
    <motion.article
      className={clsx(
        styles.card,
        variant === 'result' && styles.cardResult,
        listing.price > 300 && styles.cardSuperhost,
        onClick && 'cursor-pointer',
        variant === 'result' && 'overflow-hidden',
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={event => {
        if (!onClick) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      {variant === 'result' ? (
        compact ? (
          <div className="flex h-full flex-col">{content}</div>
        ) : (
          <div className="grid h-full gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">{content}</div>
        )
      ) : (
        <div className="flex h-full flex-col">{content}</div>
      )}
    </motion.article>
  )
}

export const ListingCard = memo(ListingCardBase)
