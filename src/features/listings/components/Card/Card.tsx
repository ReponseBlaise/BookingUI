import { createContext, useContext, type JSX, type ReactNode } from 'react'
import clsx from 'clsx'
import type { Listing } from '../../types'

type CardContextValue = {
  listing: Listing
}

type CardProps = {
  listing: Listing
  children: ReactNode
  className?: string
  onClick?: () => void
}

const CardContext = createContext<CardContextValue | null>(null)

export function Card({ listing, children, className, onClick }: CardProps): JSX.Element {
  return (
    <CardContext.Provider value={{ listing }}>
      <article
        className={clsx(
          'overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
          onClick && 'cursor-pointer',
          className,
        )}
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
        {children}
      </article>
    </CardContext.Provider>
  )
}

export function useCard(): CardContextValue {
  const context = useContext(CardContext)

  if (!context) {
    throw new Error('Card compound components must be used inside <Card>.')
  }

  return context
}
