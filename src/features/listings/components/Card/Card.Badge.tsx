import type { JSX } from 'react'
import { useCard } from './Card'

type CardBadgeProps = {
  className?: string
}

export function CardBadge({ className }: CardBadgeProps): JSX.Element {
  const { listing } = useCard()

  const badges: string[] = []
  if (listing.superhost) {
    badges.push('Superhost')
  }
  if (listing.price >= 350) {
    badges.push('Luxury')
  }

  if (badges.length === 0) {
    return <></>
  }

  return (
    <div className={className ?? 'absolute left-4 top-4 z-10 flex flex-wrap gap-2'}>
      {badges.map(badge => (
        <span
          key={badge}
          className="rounded-full border border-white/40 bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-800"
        >
          {badge}
        </span>
      ))}
    </div>
  )
}
