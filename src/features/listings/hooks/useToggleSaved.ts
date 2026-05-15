import toast from 'react-hot-toast'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'
import { persistSavedListings, useSavedListings } from './useSavedListings'

export function useToggleSaved(listingId: string) {
  const { data: savedListings = [] } = useSavedListings()

  return useApiMutation(
    async () => {
      const nextSaved = savedListings.includes(listingId)
        ? savedListings.filter((id) => id !== listingId)
        : [...savedListings, listingId]

      persistSavedListings(nextSaved)
      refreshAppData('saved')
      return nextSaved
    },
    {
      onError: () => {
        toast.error('Failed to toggle save')
      },
      onSuccess: (nextSaved) => {
        persistSavedListings(nextSaved)
        refreshAppData('saved')
      },
    },
  )
}
