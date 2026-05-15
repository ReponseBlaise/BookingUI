import { useMemo } from 'react'
import { useListings } from '../../listings'

export function ListingsList() {
  const { data, isLoading, isError } = useListings()

  const items = useMemo(() => data ?? [], [data])

  if (isLoading) return <div className="p-4">Loading listings…</div>
  if (isError) return <div className="p-4 text-red-600">Failed to load listings</div>
  if (!items.length) return <div className="p-4">No listings found.</div>

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2">
      {items.map(l => (
        <div key={l.id} className="rounded-md border border-slate-200 bg-white p-3">
          <div className="font-semibold text-slate-900">{l.title}</div>
          <div className="text-sm text-slate-500">{l.location}</div>
          <div className="mt-2 text-sm font-semibold text-slate-700">${l.price} / night</div>
        </div>
      ))}
    </div>
  )
}

export default ListingsList
