import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaArrowLeft, FaExclamationCircle, FaCheckCircle, FaArrowRight } from 'react-icons/fa'
import { listingFormSchema, type ListingFormInput } from '../schemas/listing'
import { useCreateListing } from '../hooks/useCreateListing'
import { ListingFormFields } from '../components/ListingFormFields'
import { useFormPersist, clearFormDraft } from '../../../shared/hooks/useFormPersist'

type CreateListingPageProps = {
  onBack: () => void
  onSuccess: () => void
}

export function CreateListingPage({ onBack, onSuccess }: CreateListingPageProps) {
  const createListing = useCreateListing()

  const form = useForm<ListingFormInput>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: 10,
      category: 'APARTMENT',
      image: '',
      images: [],
    },
  })

  // Enable form persistence (auto-save drafts)
  useFormPersist(form, {
    storageKey: 'listing-creation-draft',
    debounceMs: 1500,
    showNotifications: false,
    autoRestore: true,
  })

  const titleValue = form.watch('title')
  const descriptionValue = form.watch('description')
  const priceValue = form.watch('price')
  const imagesValue = form.watch('images') ?? []

  const onSubmit = form.handleSubmit(data => {
    // Clear draft after successful submission
    clearFormDraft('listing-creation-draft')
    createListing.mutate(data)
  })

  const hasValidationErrors = Object.keys(form.formState.errors).length > 0

  // Show success screen after listing is created
  if (createListing.isSuccess && createListing.data) {
    return (
      <main className="bg-[#f7f4ef] pb-12 pt-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-emerald-100 p-4">
                  <FaCheckCircle className="text-4xl text-emerald-600" aria-hidden="true" />
                </div>
              </div>

              <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900">Listing created!</h1>
              <p className="mb-6 text-slate-600">
                Your listing <strong>"{createListing.data.title}"</strong> has been created successfully.
              </p>

              <div className="mb-8 rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">What's next?</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>✓ Set availability calendar and pricing</li>
                  <li>✓ Add house rules and amenities</li>
                  <li>✓ Publish your listing to go live</li>
                </ul>
              </div>

              <div className="flex gap-3 sm:flex-row flex-col">
                <button
                  type="button"
                  onClick={onSuccess}
                  className="flex-1 rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)] transition hover:bg-[#ff5b3f] inline-flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <FaArrowRight aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    form.reset()
                    createListing.reset()
                  }}
                  className="flex-1 rounded-full border-2 border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

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
          <h1 className="mb-6 text-2xl font-black tracking-tight text-slate-900">Create a new listing</h1>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Visibility checklist</p>
                <p className="mt-1 text-sm text-slate-600">A complete listing is easier to discover in search and easier to trust.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${titleValue.length >= 10 && descriptionValue.length >= 50 && imagesValue.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {titleValue.length >= 10 && descriptionValue.length >= 50 && imagesValue.length > 0 ? 'Ready to publish' : 'Draft preview'}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ChecklistItem label="Strong title and description" done={titleValue.length >= 10 && descriptionValue.length >= 50} />
              <ChecklistItem label="At least one photo" done={imagesValue.length > 0} />
              <ChecklistItem label="Clear nightly price" done={priceValue >= 10} />
            </div>
          </div>

          {/* Error Alert */}
          {createListing.isError && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <FaExclamationCircle className="mt-0.5 text-lg text-red-600 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-red-900">Unable to create listing</p>
                <p className="mt-1 text-sm text-red-800">{createListing.error?.message || 'An unexpected error occurred'}</p>
              </div>
            </div>
          )}

          {/* Validation Errors Summary */}
          {hasValidationErrors && !createListing.isPending && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-900">Please fix the errors below before creating your listing:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800">
                {form.formState.errors.title && <li>{form.formState.errors.title.message}</li>}
                {form.formState.errors.description && <li>{form.formState.errors.description.message}</li>}
                {form.formState.errors.location && <li>{form.formState.errors.location.message}</li>}
                {form.formState.errors.price && <li>{form.formState.errors.price.message}</li>}
                {form.formState.errors.category && <li>{form.formState.errors.category.message}</li>}
              </ul>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <ListingFormFields form={form} />
            <button
              type="submit"
              disabled={createListing.isPending || hasValidationErrors}
              className="w-full rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)] transition hover:bg-[#ff5b3f] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {createListing.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating your listing...
                </span>
              ) : (
                'Create listing'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>
      {done ? '✓ ' : '• '}{label}
    </div>
  )
}
