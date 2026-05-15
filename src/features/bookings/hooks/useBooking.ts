import { useState } from 'react'
import type { Booking } from '../types'

type UseBookingReturn = {
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  cancelBooking: (id: string) => void
}

export function useBooking(): UseBookingReturn {
  const [bookings, setBookings] = useState<Booking[]>([])

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking])
  }

  const cancelBooking = (id: string) => {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' as const } : b)
    )
  }

  return { bookings, addBooking, cancelBooking }
}
