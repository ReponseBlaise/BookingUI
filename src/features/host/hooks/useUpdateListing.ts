import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'
import type { Listing } from '../../listings/types'
import type { ListingFormInput } from '../schemas/listing'

function buildListingPayload(data: ListingFormInput): {
  title: string
  description: string
  location: string
  pricePerNight: number
  guest: number
  type: 'APARTMENT' | 'VILLA' | 'CABIN' | 'HOUSE'
  amenities: string[]
} {
  const listingTypeMap = {
    city: 'APARTMENT',
    beach: 'VILLA',
    mountain: 'CABIN',
    countryside: 'HOUSE',
  } as const

  return {
    title: data.title,
    description: data.description,
    location: data.location,
    pricePerNight: data.price,
    guest: data.guest,
    type: listingTypeMap[data.category],
    amenities: data.amenities ?? [],
  }
}

export function useUpdateListing(listingId: string) {
  return useApiMutation(
    (data: ListingFormInput) => api.put<Listing>(`/api/v1/listings/${listingId}`, {
      ...buildListingPayload(data),
    }),
    {
      onSuccess: () => {
        refreshAppData(`listing:${listingId}`)
        refreshAppData('listings')
        refreshAppData('listings:mine')
        toast.success('Listing updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update listing')
      },
    },
  )
}
