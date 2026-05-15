import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import { normalizeListing, type Listing } from '../types'

type ListingsResponse = {
  data: Listing[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function useListings() {
  return useApiQuery(
    async () => {
      const response = await api.get<ListingsResponse | Listing[]>('/api/listings')
      const listings = Array.isArray(response) ? response : response.data ?? []
      return listings.map(normalizeListing)
    },
    { refreshScope: 'listings' },
  )
}
