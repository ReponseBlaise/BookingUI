import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

type SubmitReviewInput = {
  listingId: string
  rating: number
  comment: string
}

type ReviewResponse = {
  id: string
}

export function useSubmitReview(listingId: string) {
  return useApiMutation(
    async (data: SubmitReviewInput) => {
      return api.post<ReviewResponse>('/reviews/submit', data)
    },
    {
      onSuccess: () => {
        refreshAppData(`listing:${listingId}`)
        refreshAppData(`listing-reviews:${listingId}`)
        refreshAppData('listings')
        toast.success('Review submitted successfully!')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to submit review')
      },
    },
  )
}