import { z } from 'zod'
import type { ListingType } from '../../listings/types'

const listingTypes: [ListingType, ...ListingType[]] = ['APARTMENT', 'HOUSE', 'VILLA', 'CABIN']

const listingImageSchema = z
  .union([
    z.instanceof(File),
    z.string().min(1, 'Listing image is required'),
  ])
  .refine((value) => typeof value === 'string' || value.size <= 5 * 1024 * 1024, 'Image must be under 5MB')

export const listingFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(3, 'Location is required'),
  price: z.number().min(10, 'Price must be at least $10'),
  guest: z.number().min(1, 'Guest count must be at least 1'),
  amenities: z.array(z.string()).optional(),
  category: z.enum(listingTypes),
  image: listingImageSchema,
  images: z.array(listingImageSchema).min(1, 'At least one image is required').max(5, 'Maximum of 5 images'),
})

export type ListingFormInput = z.infer<typeof listingFormSchema>
