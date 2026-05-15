import { api } from '../../../lib/api'
import { useApiQuery } from '../../../shared/hooks/useApiState'
import { useAuth } from '../../auth'
import { normalizeListing, type Listing } from '../../listings/types'

export function useMyListings() {
  const { user } = useAuth()

  return useApiQuery(
    async () => {
      if (!user?.id) return [] as Listing[]
      const data = await api.get<Listing[]>(`/api/listings/host/${user.id}`)
      return data.map(normalizeListing)
    },
    { enabled: Boolean(user?.id), refreshScope: 'listings:mine' },
  )
}
