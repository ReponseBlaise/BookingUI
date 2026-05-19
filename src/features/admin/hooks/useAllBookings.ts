import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import { normalizeBooking, type ApiBooking, type Booking } from '../../bookings/types'

type UserSummary = {
  id: string
}

type BookingFilters = {
  status?: string
  page?: number
  pageSize?: number
  from?: string
  search?: string
  to?: string
}

type AllBookingsResult = {
  data: Booking[]
  total: number
}

export function useAllBookings(filters: BookingFilters = {}) {
  const { status = 'all', page = 1, pageSize = 10, from, to } = filters

  return useApiQuery(
    async () => {
      const users = await api.get<UserSummary[]>('/api/users')
      const bookingsByUser = await Promise.all(
        users.map(async user => {
          try {
            const userBookings = await api.get<ApiBooking[]>(`/api/users/${user.id}/bookings`)
            return userBookings.map(normalizeBooking)
          } catch {
            return [] as Booking[]
          }
        }),
      )

      const allBookings = bookingsByUser.flat()
      const { search = '' } = filters
      const q = search.trim().toLowerCase()

      const filtered = allBookings.filter(booking => {
        const statusMatches = status === 'all' || booking.status === status
        const createdAt = new Date(booking.createdAt)
        const fromMatches = from ? createdAt >= new Date(from) : true
        const toMatches = to ? createdAt <= new Date(to) : true
        const searchMatches =
          !q ||
          booking.id.toLowerCase().includes(q) ||
          (booking.listingTitle ?? '').toLowerCase().includes(q) ||
          (booking.guestName ?? '').toLowerCase().includes(q) ||
          String(booking.totalPrice).includes(q)

        return statusMatches && fromMatches && toMatches && searchMatches
      })

      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        data: filtered.slice(start, end),
        total: filtered.length,
      } as AllBookingsResult
    },
    { refreshScope: 'bookings:all' },
  )
}
