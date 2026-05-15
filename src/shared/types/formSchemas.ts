import { z } from "zod";

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const registerFormSchema = z
  .object({
    name: z.string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    phone: z.string().optional().nullable(),
    agreeToTerms: z.boolean().refine((val) => val, "You must agree to terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const passwordResetFormSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetFormSchema>;

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateProfileFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  phone: z.string().optional().nullable(),
  bio: z.string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .nullable(),
  website: z.string()
    .url("Invalid website URL")
    .optional()
    .nullable(),
  country: z.string().optional().nullable(),
  languagesSpoken: z.array(z.string()).optional(),
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const uploadAvatarFormSchema = z.object({
  avatar: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Avatar must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Avatar must be JPEG, PNG, or WebP"
    ),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileFormSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;
export type UploadAvatarFormData = z.infer<typeof uploadAvatarFormSchema>;

// ============================================================================
// LISTING SCHEMAS
// ============================================================================

export const createListingFormSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be less than 5000 characters"),
  address: z.string().min(5, "Address is required"),
  latitude: z.coerce.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.coerce.number().min(-180).max(180, "Invalid longitude"),
  
  listingType: z.enum(["APARTMENT", "HOUSE", "VILLA", "CABIN", "ROOM", "TOWNHOUSE", "CONDO"]),
  bedrooms: z.coerce.number().int().min(0),
  beds: z.coerce.number().int().min(1, "Must have at least 1 bed"),
  bathrooms: z.coerce.number().min(0.5),
  maxGuests: z.coerce.number().int().min(1, "Must allow at least 1 guest"),
  squareFeet: z.coerce.number().int().positive().optional(),
  
  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
  houseRules: z.array(z.string()).optional(),
  checkInMethod: z.string().min(1, "Check-in method is required"),
  
  basePricePerNight: z.coerce.number().positive("Price must be positive"),
  weekendPrice: z.coerce.number().positive().optional().nullable(),
  weeklyDiscount: z.coerce.number().min(0).max(100).optional().nullable(),
  monthlyDiscount: z.coerce.number().min(0).max(100).optional().nullable(),
  cleaningFee: z.coerce.number().min(0).optional().default(0),
  extraGuestFee: z.coerce.number().min(0).optional().nullable(),
  
  cancellationPolicy: z.enum(["FLEXIBLE", "MODERATE", "STRICT", "NON_REFUNDABLE", "LONG_TERM"]),
  minNightStay: z.coerce.number().int().min(1).default(1),
  maxNightStay: z.coerce.number().int().positive().optional().nullable(),
  instantBook: z.boolean().optional().default(false),
});

export const updateListingFormSchema = createListingFormSchema.partial();

export type CreateListingFormData = z.infer<typeof createListingFormSchema>;
export type UpdateListingFormData = z.infer<typeof updateListingFormSchema>;

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

export const createBookingFormSchema = z
  .object({
    listingId: z.string().uuid("Invalid listing ID"),
    checkInDate: z.string().datetime("Invalid check-in date"),
    checkOutDate: z.string().datetime("Invalid check-out date"),
    numberOfGuests: z.coerce.number().int().min(1, "Must have at least 1 guest"),
    specialRequests: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
    message: "Check-in must be before check-out",
    path: ["checkInDate"],
  })
  .refine((data) => new Date(data.checkInDate) > new Date(), {
    message: "Check-in must be in the future",
    path: ["checkInDate"],
  });

export type CreateBookingFormData = z.infer<typeof createBookingFormSchema>;

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export const createReviewFormSchema = z.object({
  overallRating: z.coerce.number().int().min(1, "Rating must be 1-5").max(5),
  cleanlinessRating: z.coerce.number().int().min(1).max(5),
  accuracyRating: z.coerce.number().int().min(1).max(5),
  checkInRating: z.coerce.number().int().min(1).max(5),
  communicationRating: z.coerce.number().int().min(1).max(5),
  locationRating: z.coerce.number().int().min(1).max(5),
  valueRating: z.coerce.number().int().min(1).max(5),
  comment: z.string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review must be less than 2000 characters"),
});

export type CreateReviewFormData = z.infer<typeof createReviewFormSchema>;

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

export const sendMessageFormSchema = z.object({
  threadId: z.string().uuid().optional(),
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be less than 5000 characters"),
});

export type SendMessageFormData = z.infer<typeof sendMessageFormSchema>;
