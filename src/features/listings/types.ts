export type ListingCategory = 'beach' | 'mountain' | 'city' | 'countryside'

type ApiListing = {
  id: string
  title?: string
  description?: string
  address?: string
  location?: string
  listingType?: string
  type?: string
  basePricePerNight?: number
  pricePerNight?: number
  price?: number
  averageRating?: number
  rating?: number
  reviewCount?: number
  beds?: number
  bedrooms?: number
  bathrooms?: number
  maxGuests?: number
  guests?: number
  amenities?: string[]
  status?: string
  photos?: Array<{ url?: string }>
  host?: {
    isSuperhost?: boolean
  }
  createdAt?: string
}

export interface Listing {
  id: string
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  available: boolean
  availableFrom: string
  img: string
  category: ListingCategory
  description: string
  pricePerNight: number
  reviewCount: number
  beds: number
  baths: number
  guests: number
  image: string
  photoUrls?: string[]
  saved: boolean
  tags: string[]
}

function toCategory(rawType: string | undefined): ListingCategory {
  if (rawType === 'VILLA') return 'beach'
  if (rawType === 'CABIN') return 'mountain'
  if (rawType === 'HOUSE') return 'countryside'
  return 'city'
}

export function normalizeListing(listing: ApiListing): Listing {
  const photoUrls = (listing.photos ?? []).map(photo => photo.url).filter((url): url is string => Boolean(url))
  const image = photoUrls[0] || ''
  const price = listing.price ?? listing.pricePerNight ?? listing.basePricePerNight ?? 0
  const rating = listing.rating ?? listing.averageRating ?? 0

  return {
    id: listing.id,
    title: listing.title ?? 'Untitled listing',
    location: listing.location ?? listing.address ?? 'Unknown location',
    price,
    rating,
    superhost: Boolean(listing.host?.isSuperhost),
    available: listing.status === 'ACTIVE',
    availableFrom: listing.createdAt ?? new Date().toISOString(),
    img: image,
    category: toCategory(listing.listingType ?? listing.type),
    description: listing.description ?? '',
    pricePerNight: price,
    reviewCount: listing.reviewCount ?? 0,
    beds: listing.beds ?? listing.bedrooms ?? 1,
    baths: listing.bathrooms ?? 1,
    guests: listing.maxGuests ?? listing.guests ?? 1,
    image,
    photoUrls,
    saved: false,
    tags: listing.amenities ?? [],
  }
}
