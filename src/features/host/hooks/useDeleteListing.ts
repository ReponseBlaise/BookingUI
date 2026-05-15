import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useDeleteListing(listingId: string) {
  return useApiMutation(
    () => api.delete(`/api/listings/${listingId}`),
    {
      onSuccess: () => {
        refreshAppData('listings')
        refreshAppData('listings:mine')
        refreshAppData(`listing:${listingId}`)
        toast.success('Listing deleted successfully')
      },
      onError: () => {
        toast.error('Failed to delete listing')
      },
    },
  )
}
