import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useApproveBooking(bookingId: string) {
  return useApiMutation(
    async () => api.put(`/api/v1/bookings/${bookingId}/approve`, {}),
    {
      onSuccess: () => {
        refreshAppData('bookings:host')
        refreshAppData('bookings')
        toast.success('Booking approved successfully')
      },
      onError: () => {
        toast.error('Failed to approve booking')
      },
    },
  )
}
