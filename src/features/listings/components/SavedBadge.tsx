import { useFavorites } from '../hooks/useFavorites'

export function SavedBadge() {
  const { count } = useFavorites()
  if (count === 0) return null
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff4d2d] px-1 text-[10px] font-bold leading-none text-white">
      {count}
    </span>
  )
}
