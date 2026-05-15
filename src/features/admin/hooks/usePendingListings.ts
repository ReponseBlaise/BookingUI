import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import type { Listing } from '../../listings/types'

export function usePendingListings() {
  return useApiQuery(
    () => api.get<Listing[]>('/api/admin/listings/pending'),
    { refreshScope: 'listings:pending' },
  )
}
