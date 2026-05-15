import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useBanUser() {
  return useApiMutation(
    (userId: string) =>
      api.post(`/api/admin/users/${userId}/ban`, {
        reason: 'Violation of platform policies',
      }),
    {
      onSuccess: () => {
        refreshAppData('users')
        refreshAppData('listings')
        refreshAppData('bookings')
        toast.success('User banned successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to ban user')
      },
    },
  )
}
