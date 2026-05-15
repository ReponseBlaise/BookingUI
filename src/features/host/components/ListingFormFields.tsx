import { useEffect, useState, type ChangeEvent, type JSX, type ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ListingFormInput } from '../schemas/listing'
import type { ListingCategory } from '../../listings/types'

type Props = {
  form: UseFormReturn<ListingFormInput, unknown, ListingFormInput>
}

const categories: ListingCategory[] = ['city', 'beach', 'mountain', 'countryside']

export function ListingFormFields({ form }: Props) {
  const { register, formState: { errors }, setValue, watch } = form
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState('')
  const imageValue = watch('image')
  const imagesValue = watch('images')
  const amenitiesValue = watch('amenities') ?? []

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

      <Field label="Description (min 50 chars)" error={errors.description?.message}>
        <textarea rows={4} placeholder="Describe your listing in detail..." {...register('description')} className={inputCls(!!errors.description) + ' resize-y'} />
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
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Guests" error={errors.guest?.message}>
          <input type="number" min={1} {...register('guest', { valueAsNumber: true })} className={inputCls(!!errors.guest)} />
        </Field>

        <Field label="Amenities (comma separated)" error={errors.amenities ? 'Please provide valid amenities' : undefined}>
          <input
            type="text"
            value={amenitiesValue.join(', ')}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              setValue('amenities', vals, { shouldValidate: true })
            }}
            className={inputCls(!!errors.amenities)}
            placeholder="WiFi, Kitchen, Free parking"
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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }): JSX.Element {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean): string {
  return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#ff4d2d]/30 ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-[#ff4d2d]'}`
}
