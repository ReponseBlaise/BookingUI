import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import { normalizeListing, type Listing } from '../types'

export function useListing(id: string | undefined) {
  return useApiQuery(
    async () => {
      if (!id) {
        throw new Error('Listing id is required')
      }

      const response = await api.get<Listing>(`/api/listings/${id}`)
      return normalizeListing(response)
    },
    { enabled: Boolean(id), refreshScope: id ? `listing:${id}` : 'listing' },
  )
}
