import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import { normalizeListing, type Listing } from '../../listings/types'

export function usePendingListings() {
  return useApiQuery(
    async () => {
      const listings = await api.get<Listing[]>('/api/listings?status=pending')
      const normalized = listings.map(normalizeListing)
      // Only include those that are not active/confirmed
      return normalized.filter(l => !l.available)
    },
    { refreshScope: 'listings:pending' },
  )
}
