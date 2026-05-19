import { useEffect, useState, type ChangeEvent, type JSX, type ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import toast from 'react-hot-toast'
import type { ListingFormInput } from '../schemas/listing'
import { listingTypeOptions } from '../../listings/types'
import { api } from '../../../lib/api'
import { featureFlags } from '../../../config/env'

type Props = {
  form: UseFormReturn<ListingFormInput, unknown, ListingFormInput>
}

export function ListingFormFields({ form }: Props) {
  const { register, formState: { errors }, setValue, watch } = form
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState('')
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [aiGenerationError, setAiGenerationError] = useState('')
  const [aiRetryCount, setAiRetryCount] = useState(0)
  const imageValue = watch('image')
  const imagesValue = watch('images')
  const amenitiesValue = (watch('amenities') as string[] | string | undefined) ?? []
  const titleValue = watch('title')
  const locationValue = watch('location')
  const categoryValue = watch('category')
  const guestValue = watch('guest')
  const priceValue = watch('price')

  const validateAiInputs = (): { valid: boolean; message?: string } => {
    const title = titleValue?.trim() || ''
    const location = locationValue?.trim() || ''
    
    if (!title || title.length < 10) {
      return { valid: false, message: 'Title must be at least 10 characters' }
    }
    if (!location || location.length < 3) {
      return { valid: false, message: 'Location must be at least 3 characters' }
    }
    if (!categoryValue) {
      return { valid: false, message: 'Please select a property type' }
    }
    if (!guestValue || guestValue < 1) {
      return { valid: false, message: 'Guests must be at least 1' }
    }
    if (!priceValue || priceValue < 10) {
      return { valid: false, message: 'Price must be at least $10 per night' }
    }
    if (!amenitiesValue || amenitiesValue.length === 0) {
      return { valid: false, message: 'Please add at least one amenity' }
    }
    return { valid: true }
  }

  const handleGenerateDescription = async (retryAttempt = 0): Promise<void> => {
    if (!featureFlags.enableAi) return
    setAiGenerationError('')
    
    const validation = validateAiInputs()
    if (!validation.valid) {
      setAiGenerationError(validation.message || 'Please fill in all required fields')
      toast.error(validation.message || 'Please fill in all required fields')
      return
    }

    setIsGeneratingDescription(true)
    try {
      // Normalize amenities to array
      const amenitiesArray: string[] = []
      
      if (Array.isArray(amenitiesValue)) {
        amenitiesArray.push(...amenitiesValue)
      } else if (typeof amenitiesValue === 'string') {
        const parts = amenitiesValue.split(',')
        for (const part of parts) {
          const trimmed = part.trim()
          if (trimmed.length > 0) {
            amenitiesArray.push(trimmed)
          }
        }
      }

      const response = await api.post<{ description: string }>('/api/v1/ai/generate-description', {
        title: (titleValue as string)?.trim() || '',
        location: (locationValue as string)?.trim() || '',
        type: categoryValue,
        guests: guestValue,
        amenities: amenitiesArray,
        price: priceValue,
      })

      if (!response.description || typeof response.description !== 'string') {
        throw new Error('Invalid response format from AI service')
      }

      const trimmedDescription = response.description.trim()
      if (trimmedDescription.length === 0) {
        throw new Error('Generated description is empty')
      }

      setValue('description', trimmedDescription, { shouldValidate: true, shouldDirty: true })
      setAiGenerationError('')
      setAiRetryCount(0)
      toast.success('✨ AI description generated successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate description'
      
      // Retry logic: attempt up to 2 retries for network errors
      if (retryAttempt < 2 && !errorMessage.includes('Unauthorized')) {
        setAiRetryCount(retryAttempt + 1)
        setAiGenerationError(`Retrying... (attempt ${retryAttempt + 1}/2)`)
        const delay = 1000 * (retryAttempt + 1)
        setTimeout(() => {
          void handleGenerateDescription(retryAttempt + 1)
        }, delay)
        return
      }
      
      setAiGenerationError(errorMessage)
      toast.error(errorMessage)
      setAiRetryCount(0)
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const canGenerateDescription =
    titleValue?.trim()?.length >= 10 &&
    locationValue?.trim()?.length >= 3 &&
    guestValue >= 1 &&
    priceValue >= 10 &&
    amenitiesValue?.length > 0 &&
    !isGeneratingDescription

  useEffect(() => {
    const nextPreviews: string[] = []

    if (Array.isArray(imagesValue) && imagesValue.length > 0) {
      imagesValue.forEach(image => {
        if (image instanceof File) {
          nextPreviews.push(URL.createObjectURL(image))
        } else if (typeof image === 'string' && image) {
          nextPreviews.push(image)
        }
      })

      setImagePreviews(nextPreviews)
      setImagePreview(nextPreviews[0] ?? null)
      return
    }

    if (imageValue instanceof File) {
      const reader = new FileReader()
      reader.onload = (ev: ProgressEvent<FileReader>) => setImagePreview((ev.target?.result as string) ?? null)
      reader.readAsDataURL(imageValue)
      setImagePreviews([])
      return
    }

    if (typeof imageValue === 'string' && imageValue) {
      setImagePreview(imageValue)
      setImagePreviews([imageValue])
      return
    }

    setImagePreview(null)
    setImagePreviews([])
  }, [imageValue, imagesValue])

  const handleImage = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files ?? [])
    setImageError('')
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Each image must be under 5MB')
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      return
    }

    setValue('image', validFiles[0], { shouldValidate: true })
    setValue('images', validFiles, { shouldValidate: true })
  }

  return (
    <>
      <Field label="Title (min 10 chars)" error={errors.title?.message}>
        <input type="text" placeholder="Cozy beachfront villa with ocean views" {...register('title')} className={inputCls(!!errors.title)} />
      </Field>

      <Field
        label="Description (min 50 chars)"
        error={errors.description?.message}
        action={
          featureFlags.enableAi ? (
            <button
              type="button"
              onClick={() => void handleGenerateDescription()}
              disabled={!canGenerateDescription}
              title={!canGenerateDescription ? validateAiInputs().message || 'Fill all required fields' : 'Generate description using AI'}
              className="rounded-full border border-[#ff4d2d] px-3 py-1.5 text-xs font-semibold text-[#ff4d2d] transition hover:bg-[#ff4d2d] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isGeneratingDescription ? `✨ Generating...` : aiRetryCount > 0 ? `Retry (${aiRetryCount})` : '✨ AI generate'}
            </button>
          ) : null
        }
      >
        <textarea rows={4} placeholder="Describe your listing in detail..." {...register('description')} className={inputCls(!!errors.description) + ' resize-y'} />
        {aiGenerationError && <p className="mt-1 text-xs text-amber-600">{aiGenerationError}</p>}
      </Field>

      <Field label="Location" error={errors.location?.message}>
        <input type="text" placeholder="Bali, Indonesia" {...register('location')} className={inputCls(!!errors.location)} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price per night ($)" error={errors.price?.message}>
          <input type="number" min={10} {...register('price', { valueAsNumber: true })} className={inputCls(!!errors.price)} />
        </Field>

        <Field label="Category" error={errors.category?.message}>
          <select {...register('category')} className={inputCls(!!errors.category)}>
              {listingTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Guests" error={errors.guest?.message}>
          <input type="number" min={1} {...register('guest', { valueAsNumber: true })} className={inputCls(!!errors.guest)} />
        </Field>

        <Field label="Amenities (space or comma separated)" error={errors.amenities ? 'Please provide valid amenities' : undefined}>
          <input
            type="text"
            value={Array.isArray(amenitiesValue) ? amenitiesValue.join(', ') : (typeof amenitiesValue === 'string' ? amenitiesValue : '')}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              // Split by comma or space, trim, and filter empty strings
              const vals = e.target.value
                .split(/[,\s]+/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0)
              setValue('amenities', vals, { shouldValidate: true })
            }}
            className={inputCls(!!errors.amenities)}
            placeholder="WiFi Kitchen Parking or WiFi, Kitchen, Parking"
          />
        </Field>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Listing image <span className="font-normal text-slate-400">(max 5MB)</span>
        </label>
        {imagePreview && (
          <div className="mb-3 grid gap-2 sm:grid-cols-[1.5fr_1fr_1fr]">
            <img src={imagePreview} alt="Primary preview" className="h-40 w-full rounded-xl object-cover sm:h-32" />
            {imagePreviews.slice(1, 3).map((preview, index) => (
              <img key={`${preview}-${index}`} src={preview} alt={`Preview ${index + 2}`} className="h-40 w-full rounded-xl object-cover sm:h-32" />
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImage}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#ff4d2d]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#ff4d2d]"
        />
        {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
      </div>
    </>
  )
}

function Field({ label, error, children, action }: { label: string; error?: string; children: ReactNode; action?: ReactNode }): JSX.Element {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        {action}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean): string {
  return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#ff4d2d]/30 ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-[#ff4d2d]'}`
}
