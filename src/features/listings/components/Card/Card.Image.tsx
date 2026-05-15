
import type { JSX } from 'react'
import { useCard } from './Card'

type CardImageProps = {
  className?: string
}
 
export function CardImage({ className }: CardImageProps): JSX.Element {
  const { listing } = useCard()

  return (
    <div className={className ?? 'relative aspect-4/3 bg-slate-100'}>
      {listing.img ? (
        <img src={listing.img} alt={listing.title} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-slate-300 flex items-center justify-center">
          <span className="text-slate-500 text-sm">No image</span>
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.55)_100%)]" />
    </div>
  )
}
