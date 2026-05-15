import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'

type AdminStats = {
  totalUsers: number
  totalListings: number
  totalBookings: number
  totalRevenue: number
}

type AdminStatsResponse = {
  totalUsers?: number
  totalListings?: number
  totalBookings?: number
  byRole?: Array<{ role: 'ADMIN' | 'HOST' | 'GUEST'; count: number }>
}

export function useAdminStats() {
  return useApiQuery(
    async () => {
      const response = await api.get<AdminStatsResponse>('/api/users/stats')
      return {
        totalUsers: response.totalUsers ?? 0,
        totalListings: response.totalListings ?? 0,
        totalBookings: response.totalBookings ?? 0,
        totalRevenue: 0,
      } as AdminStats
    },
    { refreshScope: 'admin:stats' },
  )
}
