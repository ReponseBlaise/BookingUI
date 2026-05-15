import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import { normalizeBooking, type ApiBooking } from '../types'

export function useMyBookings() {
  return useApiQuery(
    async () => {
      const data = await api.get<ApiBooking[]>('/api/bookings?role=guest')
      return data.map(normalizeBooking)
    },
    { refreshScope: 'bookings:me' },
  )
}
