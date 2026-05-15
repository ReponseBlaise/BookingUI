import type { JSX, ReactNode } from 'react'
import clsx from 'clsx'
import { Spinner } from './Spinner'

type ListProps<T> = {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
  loading?: boolean
  className?: string
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found.',
  loading = false,
  className,
}: ListProps<T>): JSX.Element {
  if (loading) {
    return <Spinner />
  }

  if (items.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">{emptyMessage}</p>
  }

  return (
    <div className={clsx(className)}>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
      ))}
    </div>
  )
}
