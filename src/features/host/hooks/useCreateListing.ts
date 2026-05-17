import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'
import type { Listing } from '../../listings/types'
import type { ListingFormInput } from '../schemas/listing'

type CreatedListingResponse = Listing & { id: string }

function buildListingData(data: ListingFormInput): {
  title: string
  description: string
  location: string
  pricePerNight: number
  guest: number
  type: 'APARTMENT' | 'VILLA' | 'CABIN' | 'HOUSE'
  amenities: string[]
} {
  return {
    title: data.title,
    description: data.description,
    location: data.location,
    pricePerNight: data.price,
    guest: data.guest,
    type: data.category,
    amenities: data.amenities ?? [],
  }
}

async function uploadListingImages(listingId: string, images: Array<File | string>): Promise<void> {
  const files = images.filter((image): image is File => image instanceof File)

  if (files.length === 0) return

  const formData = new FormData()
  files.slice(0, 5).forEach(file => formData.append('photos', file))

  try {
    await api.post(`/api/v1/listings/${listingId}/photos`, formData)
  } catch (error) {
    console.error('Image upload failed:', error)
    throw new Error('Your listing was created, but photo upload failed. You can upload more photos later from your dashboard.')
  }
}

function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('failed to fetch') || msg.includes('network')) return 'Connection error. Please check your internet and try again.'
    if (msg.includes('unauthorized') || msg.includes('401')) return 'Your session expired. Please log in again.'
    if (msg.includes('forbidden') || msg.includes('403') || msg.includes('not authorized')) return 'You don\'t have permission to create listings. Please ensure you\'re logged in as a Host.'
    if (msg.includes('missing required') || msg.includes('invalid') || msg.includes('400')) return 'Please check all required fields are filled correctly (title, description, location, price).'
    if (msg.includes('server error') || msg.includes('500')) return 'Server error. Please try again in a few moments.'
    if (msg.includes('image') || msg.includes('photo')) return error.message
    if (msg.includes('listing created, but')) return error.message
    if (error.message && error.message.length < 150) return error.message
  }

  return 'Something went wrong while creating your listing. Please try again.'
}

export function useCreateListing() {
  return useApiMutation(
    async (data: ListingFormInput) => {
      const payload = buildListingData(data)
      const backendPayload = {
        title: payload.title,
        description: payload.description,
        pricePerNight: payload.pricePerNight,
        guest: payload.guest,
        location: payload.location,
        type: payload.type,
        amenities: payload.amenities,
      }

      const errors: string[] = []
      if (!payload.title || String(payload.title).trim().length < 10) errors.push('Title must be at least 10 characters')
      if (!payload.description || String(payload.description).trim().length < 50) errors.push('Description must be at least 50 characters')
      if (!payload.location || String(payload.location).trim().length < 3) errors.push('Location must be at least 3 characters')
      const priceNum = Number(payload.pricePerNight)
      if (Number.isNaN(priceNum) || priceNum < 10) errors.push('Price must be at least $10')
      if (!Number.isInteger(payload.guest) || payload.guest < 1) errors.push('Guest count must be at least 1')
      if (errors.length) {
        throw new Error(errors.join('; '))
      }

      const createdListing = await api.post<CreatedListingResponse>('/api/v1/listings', backendPayload)
      const images = data.images?.length ? data.images : data.image ? [data.image] : []

      if (images.length > 0) {
        try {
          await uploadListingImages(createdListing.id, images)
        } catch (error) {
          console.error('Photo upload error after create:', error)
          toast.error('Listing was created, but photo upload failed. You can add photos later from your dashboard.')
        }
      }

      return createdListing
    },
    {
      onSuccess: () => {
        refreshAppData('listings')
        refreshAppData('listings:mine')
        toast.success('🎉 Listing created successfully! You can now add more details and publish it.')
      },
      onError: (error: Error) => {
        toast.error(getFriendlyErrorMessage(error))
      },
    },
  )
}
