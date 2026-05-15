import { useEffect, useRef, useMemo, type ChangeEvent } from 'react'
import { debounce } from 'lodash'
import { FaSearch } from 'react-icons/fa'
import { useStore } from '../../../store/StoreContext'

export function SearchBar() {
  const { dispatch } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const debouncedDispatch = useMemo(
    () =>
      debounce((value: string) => {
        dispatch({ type: 'SET_FILTER', payload: value })
      }, 300),
    [dispatch],
  )

  useEffect(() => {
    return () => debouncedDispatch.cancel()
  }, [debouncedDispatch])

  return (
    <label className="flex min-h-14 flex-1 items-center gap-3 rounded-[28px] border border-slate-200 bg-white px-5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <FaSearch className="shrink-0 text-lg text-slate-400" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        onChange={(e: ChangeEvent<HTMLInputElement>) => debouncedDispatch(e.target.value)}
        placeholder="Search by location, name, or category"
        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        aria-label="Search listings"
      />
    </label>
  )
}
