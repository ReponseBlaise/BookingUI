import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useDeclineBooking(bookingId: string) {
  return useApiMutation(
    async () => api.put(`/api/v1/bookings/${bookingId}/decline`, {}),
    {
      onSuccess: () => {
        refreshAppData('bookings:host')
        refreshAppData('bookings')
        toast.success('Booking declined')
      },
      onError: () => {
        toast.error('Failed to decline booking')
      },
    },
  )
}
