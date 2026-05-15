import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'

export type AdminUser = {
  id: string
  name: string
  email: string
  username: string
  phone: string
  role: 'ADMIN' | 'HOST' | 'GUEST'
  avatar?: string | null
  createdAt: string
  updatedAt?: string
  _count?: {
    listings?: number
  }
}

export function useUsers() {
  return useApiQuery(
    async () => api.get<AdminUser[]>('/api/users'),
    { refreshScope: 'users' },
  )
}
