import type { JSX } from 'react'
import { FaStar } from 'react-icons/fa'
import { useCard } from './Card'

type CardRatingProps = {
  className?: string
}

export function CardRating({ className }: CardRatingProps): JSX.Element {
  const { listing } = useCard()

  return (
    <p className={className ?? 'px-5 pb-1 text-sm text-slate-600'}>
      <span className="inline-flex items-center gap-2">
        <FaStar aria-hidden="true" className="text-[#ffb020]" />
        {listing.rating.toFixed(1)} ({listing.reviewCount.toLocaleString()} reviews)
      </span>
    </p>
  )
}
