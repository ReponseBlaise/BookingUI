import type { JSX } from 'react'
import { useCard } from './Card'

type CardPriceProps = {
  className?: string
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function CardPrice({ className }: CardPriceProps): JSX.Element {
  const { listing } = useCard()

  return (
    <p className={className ?? 'px-5 pb-5 pt-3 text-sm font-semibold text-slate-700'}>
      <span className="text-2xl font-bold text-slate-900">{currency.format(listing.price)}</span> / night
    </p>
  )
}
