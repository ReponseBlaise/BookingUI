import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import { normalizeListing, type Listing } from '../../listings/types'

export function usePendingListings() {
  return useApiQuery(
    async () => {
      const listings = await api.get<Listing[]>('/api/listings')
      return listings.map(normalizeListing)
    },
    { refreshScope: 'listings:pending' },
  )
}
