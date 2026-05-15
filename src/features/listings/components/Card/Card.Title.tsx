import type { JSX } from 'react'
import { useCard } from './Card'

type CardTitleProps = {
  className?: string
}

export function CardTitle({ className }: CardTitleProps): JSX.Element {
  const { listing } = useCard()

  return (
    <h3 className={className ?? 'px-5 pt-5 text-xl font-bold tracking-[-0.03em] text-slate-900'}>
      {listing.title}
    </h3>
  )
}
