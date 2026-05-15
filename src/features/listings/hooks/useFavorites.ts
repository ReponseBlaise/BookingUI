import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData } from '../../../shared/hooks/useApiState'
import { persistSavedListings, useSavedListings } from './useSavedListings'

type UseFavoritesReturn = {
  toggle: (id: string, title: string) => void
  isSaved: (id: string) => boolean
  count: number
}

export function useFavorites(): UseFavoritesReturn {
  const { data: savedListings = [] } = useSavedListings()

  const toggle = (id: string, title: string) => {
    const isSaved = savedListings.includes(id)
    const nextSaved = isSaved
      ? savedListings.filter((savedId) => savedId !== id)
      : [...savedListings, id]

    void (async () => {
      try {
        await api.post(`/api/saved/${id}`)
        persistSavedListings(nextSaved)
        refreshAppData('saved')
        toast(isSaved ? `Removed: ${title}` : `Saved: ${title}`, {
          icon: isSaved ? '💔' : '❤️',
        })
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Failed to toggle save')
      }
    })()
  }

  const isSaved = (id: string) => savedListings.includes(id)

  return { toggle, isSaved, count: savedListings.length }
}
