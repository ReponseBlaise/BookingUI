import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'

export type ListingReview = {
  id: string
  rating: number
  comment: string
  createdAt: string
  user?: {
    id?: string
    name?: string
    avatar?: string | null
  }
}

export function useListingReviews(listingId: string | undefined) {
  return useApiQuery(
    async () => {
      if (!listingId) {
        throw new Error('Listing id is required')
      }

      return api.get<ListingReview[]>(`/reviews/listing/${listingId}/all`)
    },
    {
      enabled: Boolean(listingId),
      refreshScope: listingId ? `listing-reviews:${listingId}` : 'listing-reviews',
    },
  )
}