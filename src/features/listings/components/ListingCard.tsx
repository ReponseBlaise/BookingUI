import { memo } from 'react'
import { motion } from 'framer-motion'
import { FaHeart, FaStar } from 'react-icons/fa'
import clsx from 'clsx'
import type { Listing } from '../types'
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

function ListingCardBase({ listing, onToggleSave = () => {}, onClick, onBook, variant = 'featured', compact = false }: ListingCardProps) {
  const { data: savedListings = [] } = useSavedListings()
  const toggleSave = useToggleSaved(listing.id)
  const savedState = savedListings.includes(listing.id)

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
          <div className="flex h-full flex-col">
            <div className="relative aspect-[4/3] overflow-hidden">
              {listing.img ? (
                <img src={listing.img} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-200">
                  <span className="text-sm text-slate-500">No image</span>
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-lg bg-slate-900/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
                Featured
              </div>
              <button
                type="button"
                onClick={event => {
                  event.stopPropagation()
                  toggleSave.mutate()
                  onToggleSave()
                }}
                className={clsx(
                  'absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white text-slate-500 shadow-sm transition',
                  savedState && 'text-[#ff4d2d]',
                )}
                aria-label={savedState ? `Unsave ${listing.title}` : `Save ${listing.title}`}
                aria-pressed={savedState}
              >
                <FaHeart aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1 text-sm font-semibold text-[#ff4d2d]">
                    <FaStar aria-hidden="true" />
                    <span>({listing.rating.toFixed(1)}) {listing.reviewCount.toLocaleString()} reviews</span>
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">
                    {listing.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation()
                    toggleSave.mutate()
                    onToggleSave()
                  }}
                  className={clsx(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-[#ff4d2d]',
                    savedState && 'text-[#ff4d2d]',
                  )}
                  aria-label={savedState ? `Unsave ${listing.title}` : `Save ${listing.title}`}
                  aria-pressed={savedState}
                >
                  <FaHeart aria-hidden="true" />
                </button>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                {listing.description || 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#ff4d2d]/10 px-3 py-1.5 text-sm font-semibold text-[#ff4d2d]">
                  {currency.format(listing.price)} / night
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                  {listing.category}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{listing.location}</span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-slate-400">●</span> {listing.beds} bed{listing.beds !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-slate-400">●</span> {listing.guests} guest{listing.guests !== 1 ? 's' : ''}
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
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation()
                    onBook?.()
                  }}
                  className="rounded-full bg-[#ff4d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff5b3f] disabled:opacity-60"
                  disabled={!onBook}
                >
                  Book now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="relative min-h-55 overflow-hidden">
            {listing.img ? (
              <img src={listing.img} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-55 items-center justify-center bg-slate-200">
                <span className="text-sm text-slate-500">No image</span>
              </div>
            )}
            <div className="absolute left-4 top-4 rounded-lg bg-slate-900/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              Featured
            </div>
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                toggleSave.mutate()
                onToggleSave()
              }}
              className={clsx(
                'absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white text-slate-500 shadow-sm transition',
                savedState && 'text-[#ff4d2d]',
              )}
              aria-label={savedState ? `Unsave ${listing.title}` : `Save ${listing.title}`}
              aria-pressed={savedState}
            >
              <FaHeart aria-hidden="true" />
            </button>
          </div>

          <div className={clsx('relative p-5 sm:p-6', compact && 'sm:p-5')}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1 text-sm font-semibold text-[#ff4d2d]">
                  <FaStar aria-hidden="true" />
                  <span>({listing.rating.toFixed(1)}) {listing.reviewCount.toLocaleString()} reviews</span>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <h3 className={clsx('font-semibold tracking-[-0.03em] text-slate-900', compact ? 'text-xl' : 'text-2xl')}>
                    {listing.title}
                  </h3>
                  {listing.superhost && <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white">✓</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={event => {
                  event.stopPropagation()
                  toggleSave.mutate()
                  onToggleSave()
                }}
                className={clsx(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-[#ff4d2d]',
                  savedState && 'text-[#ff4d2d]',
                )}
                aria-label={savedState ? `Unsave ${listing.title}` : `Save ${listing.title}`}
                aria-pressed={savedState}
              >
                <FaHeart aria-hidden="true" />
              </button>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {listing.description || 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-[#ff4d2d]/10 px-3 py-1.5 text-sm font-semibold text-[#ff4d2d]">
                {currency.format(listing.price)} / night
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                {listing.category}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{listing.location}</span>
              <span className="inline-flex items-center gap-2">
                <span className="text-slate-400">●</span> {listing.beds} bed{listing.beds !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-slate-400">●</span> {listing.guests} guest{listing.guests !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#ff4d2d] hover:text-[#ff4d2d]">
                {listing.location}
              </button>
              <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#ff4d2d] hover:text-[#ff4d2d]">
                Directions
              </button>
            </div>
          </div>
          </div>
        )
      ) : (
        <div className={clsx('relative overflow-hidden', compact ? 'aspect-4/3' : 'aspect-4/3')}>
          <div className="absolute inset-0 z-0 block" aria-label={`Open ${listing.title}`}>
            {listing.img ? (
              <img src={listing.img} alt={listing.title} className={styles.image} />
            ) : (
              <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                <span className="text-slate-500 text-sm">No image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.55)_75%,rgba(15,23,42,0.88)_100%)]" />
            <div className={clsx('absolute inset-x-0 bottom-0 text-white', compact ? 'p-3' : 'p-4 sm:p-5')}>
              <p className="flex items-center gap-1 text-sm font-medium text-white">
                <FaStar aria-hidden="true" className="text-white" />
                <span>({listing.rating.toFixed(1)}) {listing.reviewCount.toLocaleString()} reviews</span>
              </p>

              <div className="mt-1.5 flex items-center gap-2">
                <h3 className={clsx('font-semibold tracking-[-0.03em] text-white', compact ? 'text-base' : 'text-lg sm:text-xl')}>{listing.title}</h3>
                {listing.superhost && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white">✓</span>}
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={event => {
              event.stopPropagation()
              toggleSave.mutate()
              onToggleSave()
            }}
            className={clsx(
              'absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-sm transition',
              savedState && 'bg-white text-[#ff4d2d]',
            )}
            aria-label={savedState ? `Unsave ${listing.title}` : `Save ${listing.title}`}
            aria-pressed={savedState}
          >
            <FaHeart aria-hidden="true" />
          </button>
        </div>
      )}
    </motion.article>
  )
}

export const ListingCard = memo(ListingCardBase)
