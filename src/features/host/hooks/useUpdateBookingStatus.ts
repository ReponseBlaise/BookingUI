import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

export function useUpdateBookingStatus(bookingId: string) {
  return useApiMutation(
    (status: 'CONFIRMED' | 'CANCELLED') =>
      status === 'CONFIRMED'
        ? api.put(`/bookings/${bookingId}/approve`, {})
        : api.put(`/bookings/${bookingId}/decline`, { reason: 'Declined by host from dashboard' }),
    {
      onSuccess: (_data, status) => {
        refreshAppData('bookings:host')
        refreshAppData('bookings')
        toast.success(status === 'CONFIRMED' ? 'Booking approved' : 'Booking declined')
      },
      onError: () => {
        toast.error('Failed to update booking status')
      },
    },
  )
}
