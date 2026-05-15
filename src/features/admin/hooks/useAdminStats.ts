import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'

type AdminStats = {
  totalUsers: number
  totalListings: number
  totalBookings: number
  totalRevenue: number
}

type AdminStatsResponse = {
  users?: { total?: number }
  listings?: { total?: number }
  bookings?: { total?: number }
}

export function useAdminStats() {
  return useApiQuery(
    async () => {
      const response = await api.get<AdminStatsResponse>('/api/admin/stats')
      return {
        totalUsers: response.users?.total ?? 0,
        totalListings: response.listings?.total ?? 0,
        totalBookings: response.bookings?.total ?? 0,
        totalRevenue: 0,
      } as AdminStats
    },
    { refreshScope: 'admin:stats' },
  )
}
