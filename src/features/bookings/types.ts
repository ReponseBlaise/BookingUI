export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export type ApiBookingStatus =
  | 'PENDING'
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'

export type ApiBooking = {
  id: string
  listingId: string
  guestId: string
  status: ApiBookingStatus
  checkIn?: string
  checkOut?: string
  checkInDate?: string
  checkOutDate?: string
  guests?: number
  numberOfGuests?: number
  totalPrice?: number
  totalCostGuest?: number
  createdAt: string
  listing?: {
    title?: string
    photos?: Array<{ url?: string }>
  }
  guest?: {
    name?: string
    email?: string
  }
}

export type Booking = {
  id: string
  listingId: string
  guestId: string
  listingTitle?: string
  listingImage?: string
  guestName?: string
  guestEmail?: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: BookingStatus
  createdAt: string
}

export function normalizeBookingStatus(status: string | undefined): BookingStatus {
  if (!status) return 'PENDING'

  if (status === 'PENDING' || status === 'PENDING_APPROVAL') return 'PENDING'
  if (status === 'CONFIRMED') return 'CONFIRMED'
  if (status === 'CANCELLED') return 'CANCELLED'
  if (status === 'CHECKED_IN' || status === 'CHECKED_OUT' || status === 'COMPLETED') return 'COMPLETED'

  return 'PENDING'
}

export function normalizeBooking(booking: ApiBooking): Booking {
  const checkIn = booking.checkIn ?? booking.checkInDate ?? ''
  const checkOut = booking.checkOut ?? booking.checkOutDate ?? ''

  return {
    id: booking.id,
    listingId: booking.listingId,
    guestId: booking.guestId,
    listingTitle: booking.listing?.title,
    listingImage: booking.listing?.photos?.[0]?.url,
    guestName: booking.guest?.name,
    guestEmail: booking.guest?.email,
    checkIn,
    checkOut,
    guests: booking.guests ?? booking.numberOfGuests ?? 1,
    totalPrice: booking.totalPrice ?? booking.totalCostGuest ?? 0,
    status: normalizeBookingStatus(booking.status),
    createdAt: booking.createdAt,
  }
}

export type CreateBookingInput = {
  listingId: string
  checkIn: string
  checkOut: string
  guests: number
  guestName: string
  guestEmail: string
  guestPhone: string
  profilePhoto?: string
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  totalPrice: number
}

export type BookingStep1 = {
  checkIn: string
  checkOut: string
  guests: number
}

export type BookingStep2 = {
  name: string
  email: string
  phone: string
  profilePhoto?: File
}

export type BookingStep3 = {
  card: string
  expiry: string
  cvv: string
}
