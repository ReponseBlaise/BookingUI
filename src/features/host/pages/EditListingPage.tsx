import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaArrowLeft, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { listingFormSchema, type ListingFormInput } from '../schemas/listing'
import { useUpdateListing } from '../hooks/useUpdateListing'
import { useListing } from '../../listings/hooks/useListing'
import { ListingFormFields } from '../components/ListingFormFields'
import { Spinner } from '../../../shared/components/Spinner'
import { api } from '../../../lib/api'
import { refreshAppData } from '../../../shared/hooks/useApiState'

type ListingPhoto = {
  id: string
  url: string
}

type ListingWithBackendFields = {
  title?: string
  description?: string
  location?: string
  address?: string
  price?: number
  basePricePerNight?: number
  category?: string
  listingType?: string
  image?: string
  img?: string
  photos?: ListingPhoto[]
}

type EditListingPageProps = {
  id: string
  onBack: () => void
  onSuccess: () => void
}

export function EditListingPage({ id, onBack, onSuccess }: EditListingPageProps) {
  const { data: listing, isLoading } = useListing(id)
  const updateListing = useUpdateListing(id)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)

  const form = useForm<ListingFormInput>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: 10,
      category: 'city',
      image: '',
      images: [],
    },
  })

  useEffect(() => {
    if (listing) {
      const source = listing as unknown as ListingWithBackendFields
      const listingType = (source.category ?? source.listingType ?? 'city').toLowerCase()
      form.reset({
        title: source.title ?? '',
        description: source.description ?? '',
        location: source.location ?? source.address ?? '',
        price: source.price ?? source.basePricePerNight ?? 10,
        category: (['beach', 'mountain', 'city', 'countryside'].includes(listingType) ? listingType : 'city') as ListingFormInput['category'],
        image: source.image ?? source.img ?? source.photos?.[0]?.url ?? '',
        images: source.photos?.map(photo => photo.url).filter(Boolean) ?? (source.image ? [source.image] : []),
      })
    }
  }, [listing, form])

  useEffect(() => {
    if (updateListing.isSuccess) {
      onSuccess()
    }
  }, [updateListing.isSuccess, onSuccess])

  const photos = ((listing as unknown as ListingWithBackendFields | undefined)?.photos ?? []) as ListingPhoto[]
  const photoCount = photos.length

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setSelectedFiles(files)
  }

  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one photo to upload.')
      return
    }

    const availableSlots = Math.max(0, 5 - photoCount)
    if (availableSlots === 0) {
      toast.error('Maximum of 5 photos allowed for a listing.')
      return
    }

    const filesToUpload = selectedFiles.slice(0, availableSlots)
    const formData = new FormData()
    filesToUpload.forEach(file => formData.append('photos', file))

    setIsUploadingPhotos(true)
    try {
      await api.post(`/api/v1/listings/${id}/photos`, formData)
      refreshAppData(`listing:${id}`)
      refreshAppData('listings:mine')
      setSelectedFiles([])
      toast.success(`${filesToUpload.length} photo${filesToUpload.length > 1 ? 's' : ''} uploaded successfully.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload photos')
    } finally {
      setIsUploadingPhotos(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    setDeletingPhotoId(photoId)
    try {
      await api.delete(`/api/v1/listings/${id}/photos/${photoId}`)
      refreshAppData(`listing:${id}`)
      refreshAppData('listings:mine')
      toast.success('Photo deleted successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete photo')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  const onSubmit = form.handleSubmit(data => {
    updateListing.mutate(data)
  })

  if (isLoading) return <Spinner />

  return (
    <main className="bg-[#f7f4ef] pb-12 pt-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#ff4d2d]"
        >
          <FaArrowLeft aria-hidden="true" /> Back to dashboard
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Host</p>
          <h1 className="mb-6 text-2xl font-black tracking-tight text-slate-900">Edit listing</h1>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Listing Photos</p>
                <p className="text-xs text-slate-600">Upload up to 5 photos. You can delete existing photos anytime.</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{photoCount}/5</span>
            </div>

            {photos.length > 0 ? (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map(photo => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <img src={photo.url} alt="Listing" className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingPhotoId === photo.id}
                      className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow hover:bg-red-700 disabled:opacity-60"
                    >
                      <FaTrash aria-hidden="true" />
                      {deletingPhotoId === photo.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-sm text-slate-600">No photos uploaded yet.</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelection}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#ff4d2d]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#ff4d2d]"
              />
              <button
                type="button"
                onClick={handleUploadPhotos}
                disabled={isUploadingPhotos || selectedFiles.length === 0 || photoCount >= 5}
                className="rounded-full bg-[#ff4d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff5b3f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingPhotos ? 'Uploading...' : 'Upload Photos'}
              </button>
            </div>
          </section>

          <form onSubmit={onSubmit} className="space-y-5">
            <ListingFormFields form={form} />
            <button
              type="submit"
              disabled={updateListing.isPending}
              className="w-full rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)] transition hover:bg-[#ff5b3f] disabled:opacity-60"
            >
              {updateListing.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
