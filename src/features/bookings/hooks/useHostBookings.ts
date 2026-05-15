import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import { normalizeBooking, type ApiBooking } from '../types'

export function useHostBookings() {
  return useApiQuery(
    async () => {
      const data = await api.get<ApiBooking[]>('/api/v1/bookings?role=host')
      return data.map(normalizeBooking)
    },
    { refreshScope: 'bookings:host' },
  )
}
