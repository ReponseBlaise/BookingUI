import { useEffect, useState } from 'react'

const SAVED_KEY = 'saved'

export function persistSavedListings(ids: string[]): void {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids))
}

function loadSavedListings(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useSavedListings() {
  const [data, setData] = useState<string[]>(loadSavedListings())
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = async () => {
    setIsLoading(true)
    setIsError(false)
    setError(null)
    const fallback = loadSavedListings()
    setData(fallback)
    setIsLoading(false)
    return fallback
  }

  useEffect(() => {
    void refetch()
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SAVED_KEY) return
      setData(loadSavedListings())
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}
