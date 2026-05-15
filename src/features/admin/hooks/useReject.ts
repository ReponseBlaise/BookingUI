import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useReject() {
  return useApiMutation(
    (id: string) => api.patch(`/api/listings/${id}/status`, { status: 'rejected' }),
    {
      onSuccess: () => {
        refreshAppData('listings:pending')
        refreshAppData('listings')
        toast.success('Listing rejected')
      },
      onError: () => {
        toast.error('Failed to reject listing')
      },
    },
  )
}
