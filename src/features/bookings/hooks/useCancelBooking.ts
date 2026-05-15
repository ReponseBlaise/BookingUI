import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useCancelBooking(bookingId: string) {
  return useApiMutation(
    async () => api.put(`/bookings/${bookingId}/cancel`, { reason: 'Cancelled by guest from dashboard' }),
    {
      onSuccess: () => {
        refreshAppData('bookings:me')
        refreshAppData('bookings')
        toast.success('Booking cancelled successfully')
      },
      onError: () => {
        toast.error('Failed to cancel booking')
      },
    },
  )
}
