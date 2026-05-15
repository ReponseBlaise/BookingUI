import { z } from 'zod'

export const bookingStep1Schema = z
  .object({
    checkIn: z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
    guests: z.number().min(1, 'At least 1 guest required').max(16, 'Maximum 16 guests allowed'),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  })

export const bookingStep2Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number must be at least 7 characters'),
  profilePhoto: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'Profile photo must be under 5MB'),
})

export const bookingStep3Schema = z.object({
  card: z.string().regex(/^\d{16}$/, 'Card number must be exactly 16 digits'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be MM/YY format'),
  cvv: z.string().regex(/^\d{3}$/, 'CVV must be exactly 3 digits'),
})

export const createBookingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest required').max(16, 'Maximum 16 guests allowed'),
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  guestEmail: z.string().email('Invalid email address'),
  guestPhone: z.string().min(7, 'Phone number must be at least 7 characters'),
  profilePhoto: z.string().optional(),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be exactly 16 digits'),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be MM/YY format'),
  cardCvv: z.string().regex(/^\d{3}$/, 'CVV must be exactly 3 digits'),
  totalPrice: z.number().min(0, 'Total price must be positive'),
})

export type BookingStep1Input = z.infer<typeof bookingStep1Schema>
export type BookingStep2Input = z.infer<typeof bookingStep2Schema>
export type BookingStep3Input = z.infer<typeof bookingStep3Schema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
