import type { JSX } from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { useCard } from './Card'

type CardLocationProps = {
  className?: string
}

export function CardLocation({ className }: CardLocationProps): JSX.Element {
  const { listing } = useCard()

  return (
    <p className={className ?? 'px-5 pt-4 text-sm text-slate-500'}>
      <span className="inline-flex items-center gap-2">
        <FaMapMarkerAlt aria-hidden="true" className="text-[#ff4d2d]" />
        {listing.location}
      </span>
    </p>
  )
}
