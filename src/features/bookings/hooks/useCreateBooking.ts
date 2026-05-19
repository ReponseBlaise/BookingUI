import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'
import { normalizeBooking, type ApiBooking } from '../types'

type BookingPayload = {
  listingId: string
  checkIn: string
  checkOut: string
  guests: number
  guestName: string
  guestEmail: string
  guestPhone: string
  profilePhoto?: File | string
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  totalPrice: number
  nights?: number
}

function buildBookingPayload(data: BookingPayload): Record<string, string | number> {
  return {
    listingId: data.listingId,
    checkIn: new Date(data.checkIn).toISOString(),
    checkOut: new Date(data.checkOut).toISOString(),
    guests: data.guests,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone ?? '',
    totalPrice: data.totalPrice,
    ...(data.nights ? { nights: data.nights } : {}),
  }
}

export function useCreateBooking(listingId: string) {
  return useApiMutation(
    async (data: BookingPayload) => {
      const created = await api.post<ApiBooking>('/bookings/request', buildBookingPayload(data))
      return normalizeBooking(created)
    },
    {
      onSuccess: () => {
        refreshAppData('bookings')
        refreshAppData('listing:' + listingId)
        toast.success('Booking created successfully!')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create booking')
      },
    },
  )
}
