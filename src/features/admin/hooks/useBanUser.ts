import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useBanUser() {
  return useApiMutation(
    (userId: string) => api.delete(`/api/users/${userId}`),
    {
      onSuccess: () => {
        refreshAppData('users')
        refreshAppData('listings')
        refreshAppData('bookings')
        toast.success('User removed successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to remove user')
      },
    },
  )
}
