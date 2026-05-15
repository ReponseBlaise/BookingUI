import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useApprove() {
  return useApiMutation(
    (id: string) => api.patch(`/api/listings/${id}/status`, { status: 'approved' }),
    {
      onSuccess: () => {
        refreshAppData('listings:pending')
        refreshAppData('listings')
        toast.success('Listing approved')
      },
      onError: () => {
        toast.error('Failed to approve listing')
      },
    },
  )
}
