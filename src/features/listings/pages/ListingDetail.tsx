import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { FaArrowLeft, FaCheckCircle, FaStar } from 'react-icons/fa'
import { Spinner } from '../../../shared/components/Spinner'
import { useListing } from '../hooks/useListing'
import { useListingReviews } from '../hooks/useListingReviews'
import { useSubmitReview } from '../hooks/useSubmitReview'
import { Card } from '../components/Card'
import { MapPreview } from '../../../shared/components/MapPreview'
import { useAuth } from '../../auth'
import { useCreateBooking } from '../../bookings'
import type { Listing } from '../types'

type ListingDetailProps = {
  id: string
  onBack: () => void
  onBooked: () => void
  onRequireLogin: () => void
  onOpenBookingForm: (listing: Listing) => void
}

export function ListingDetail({ id, onBack, onBooked, onRequireLogin, onOpenBookingForm }: ListingDetailProps) {
  const { data: listing, isLoading, isError } = useListing(id)
  const { data: reviews = [], isLoading: isReviewsLoading, refetch: refetchReviews } = useListingReviews(id)
  const { user } = useAuth()
  const createBooking = useCreateBooking(id)
  const submitReview = useSubmitReview(id)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => {
    if (!listing) return

    const availableFrom = dayjs(listing.availableFrom)
    const tomorrow = dayjs().add(1, 'day')
    const firstNight = availableFrom.isAfter(tomorrow, 'day') ? availableFrom : tomorrow
    const firstNightText = firstNight.format('YYYY-MM-DD')
    const checkoutText = firstNight.add(1, 'day').format('YYYY-MM-DD')

    setCheckIn(firstNightText)
    setCheckOut(checkoutText)
    setGuests(Math.min(Math.max(1, listing.guests), 16))
  }, [listing])

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1
    return Math.max(1, dayjs(checkOut).diff(dayjs(checkIn), 'day'))
  }, [checkIn, checkOut])

  const minCheckIn = useMemo(() => dayjs().add(1, 'day').format('YYYY-MM-DD'), [])
  const minCheckOut = useMemo(() => {
    if (!checkIn) return dayjs().add(2, 'day').format('YYYY-MM-DD')
    return dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD')
  }, [checkIn])
  const invalidBookingDates = !checkIn || !checkOut || dayjs(checkOut).diff(dayjs(checkIn), 'day') <= 0
  const invalidGuestCount = guests < 1 || guests > Math.max(1, listing?.guests ?? 1)
  const invalidReviewComment = reviewComment.trim().length < 10

  const handleCreateBooking = () => {
    if (!listing) return

    if (!user) {
      toast.error('Please sign in as a guest to create a booking.')
      onRequireLogin()
      return
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates.')
      return
    }

    if (dayjs(checkOut).diff(dayjs(checkIn), 'day') <= 0) {
      toast.error('Check-out must be after check-in.')
      return
    }

    if (guests < 1 || guests > Math.max(1, listing.guests)) {
      toast.error(`Guests must be between 1 and ${Math.max(1, listing.guests)}.`)
      return
    }

    void createBooking
      .mutateAsync({
        listingId: listing.id,
        checkIn,
        checkOut,
        guests,
        guestName: user.name,
        guestEmail: user.email,
        guestPhone: user.phone ?? '',
        cardNumber: '4111111111111111',
        cardExpiry: '12/30',
        cardCvv: '123',
        totalPrice: listing.price * nights,
      })
      .then(() => {
        onBooked()
      })
      .catch(() => undefined)
  }

  const handleSubmitReview = () => {
    if (!listing) return

    if (!user) {
      toast.error('Please sign in to leave a review.')
      onRequireLogin()
      return
    }

    if (reviewComment.trim().length < 10) {
      toast.error('Your review must be at least 10 characters long.')
      return
    }

    void submitReview
      .mutateAsync({
        listingId: listing.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      .then(async () => {
        setReviewComment('')
        setReviewRating(5)
        await refetchReviews()
      })
      .catch(() => undefined)
  }

  if (isLoading) return <Spinner />

  if (isError || !listing) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-84px)] max-w-4xl items-center justify-center px-4 py-12">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">Listing not found</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff4d2d] px-5 py-3 text-sm font-semibold text-white"
          >
            <FaArrowLeft aria-hidden="true" />
            Go back
          </button>
        </div>
      </main>
    )
  }

  const gallery = listing.photoUrls?.length ? listing.photoUrls : [listing.img].filter(Boolean)
  const heroImage = gallery[0] ?? listing.img
  const sideImages = gallery.slice(1, 4)

  return (
    <main className="bg-[#f6f5f1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#ff4d2d] hover:text-[#ff4d2d]"
        >
          <FaArrowLeft aria-hidden="true" />
          Back
        </button>

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-2 p-3 sm:p-4">
              <div className="relative min-h-88 overflow-hidden rounded-4xl bg-slate-100">
                <img src={heroImage} alt={listing.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.03)_0%,rgba(15,23,42,0.28)_100%)]" />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {sideImages.length > 0 ? (
                  sideImages.map((photo, index) => (
                    <div key={`${photo}-${index}`} className="overflow-hidden rounded-2xl bg-slate-100">
                      <img src={photo} alt={`${listing.title} photo ${index + 2}`} className="h-28 w-full object-cover sm:h-36" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="overflow-hidden rounded-2xl bg-slate-100"><img src={heroImage} alt={listing.title} className="h-28 w-full object-cover sm:h-36" /></div>
                    <div className="overflow-hidden rounded-2xl bg-slate-100"><img src={heroImage} alt={listing.title} className="h-28 w-full object-cover sm:h-36" /></div>
                    <div className="overflow-hidden rounded-2xl bg-slate-100"><img src={heroImage} alt={listing.title} className="h-28 w-full object-cover sm:h-36" /></div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <Card listing={listing} className="rounded-2xl border border-slate-200 shadow-none">
                <div className="relative">
                  <Card.Badge className="absolute left-3 top-3 z-10 flex gap-2" />
                </div>
                <Card.Location className="px-4 pt-4 text-xs text-slate-500" />
                <Card.Title className="px-4 pt-2 text-2xl font-bold tracking-[-0.04em] text-slate-900" />
                <Card.Rating className="px-4 pb-0 pt-2 text-sm text-slate-600" />
                <Card.Price className="px-4 pb-4 pt-2 text-sm font-semibold text-slate-700" />
              </Card>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-700">
                  <FaStar aria-hidden="true" className="text-[#ffb020]" />
                  {listing.rating.toFixed(2)}
                </span>
                {listing.superhost && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4d2d]/10 px-3 py-2 font-semibold text-[#ff4d2d]">
                    <FaCheckCircle aria-hidden="true" />
                    Superhost
                  </span>
                )}
                <span className={listing.available ? 'rounded-full bg-emerald-100 px-3 py-2 font-semibold text-emerald-700' : 'rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-600'}>
                  {listing.available ? 'Available' : 'Booked'}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Available from</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{dayjs(listing.availableFrom).format('MMM D, YYYY')}</p>
              </div>

              <p className="text-sm leading-7 text-slate-600">{listing.description}</p>

              <MapPreview title={`${listing.location} map`} location={listing.location} height={240} />

              {listing.available && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ff4d2d]">Booking form</p>
                    <h2 className="mt-1 text-lg font-bold tracking-[-0.03em] text-slate-900">Request your stay</h2>
                    <p className="mt-1 text-sm text-slate-600">New bookings start as pending, then the host can confirm them from the host dashboard.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Check-in
                      <input
                        type="date"
                        value={checkIn}
                        min={minCheckIn}
                        onChange={event => setCheckIn(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/20"
                      />
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                      Check-out
                      <input
                        type="date"
                        value={checkOut}
                        min={minCheckOut}
                        onChange={event => setCheckOut(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/20"
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-slate-700">
                    Guests
                    <input
                      type="number"
                      value={guests}
                      min={1}
                      max={Math.max(1, listing.guests)}
                      onChange={event => setGuests(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(1, listing.guests)))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/20"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleCreateBooking}
                    disabled={createBooking.isPending || invalidBookingDates || invalidGuestCount}
                    aria-invalid={invalidBookingDates || invalidGuestCount}
                    className="w-full rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)] transition hover:bg-[#ff5b3f] disabled:opacity-60"
                  >
                    {createBooking.isPending
                      ? 'Creating booking request...'
                      : `Request booking — $${listing.price} / night × ${nights} nights = $${listing.price * nights}`}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenBookingForm(listing)}
                    className="w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#ff4d2d] hover:text-[#ff4d2d]"
                  >
                    Open full booking form
                  </button>
                </div>
              )}

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ff4d2d]">Reviews</p>
                    <h2 className="mt-1 text-lg font-bold tracking-[-0.03em] text-slate-900">
                      Rate this listing
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {listing.reviewCount > 0
                        ? `${listing.reviewCount} review${listing.reviewCount === 1 ? '' : 's'} • ${listing.rating.toFixed(2)} average rating`
                        : 'Be the first to leave a review for this stay.'}
                    </p>
                  </div>
                </div>

                {user ? (
                  <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1
                        const active = value <= reviewRating
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewRating(value)}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${active ? 'border-[#ffb020] bg-[#ffb020]/10 text-[#ffb020]' : 'border-slate-200 bg-white text-slate-300 hover:border-[#ffb020] hover:text-[#ffb020]'}`}
                            aria-label={`${value} star${value === 1 ? '' : 's'}`}
                            aria-pressed={active}
                          >
                            <FaStar aria-hidden="true" />
                          </button>
                        )
                      })}
                    </div>

                    <label className="block text-sm font-semibold text-slate-700">
                      Your review
                      <textarea
                        value={reviewComment}
                        onChange={event => setReviewComment(event.target.value)}
                        placeholder="Tell future guests what stood out about the stay."
                        rows={4}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/20"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={submitReview.isPending || invalidReviewComment}
                      className="rounded-full bg-[#ff4d2d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff5b3f] disabled:opacity-60"
                    >
                      {submitReview.isPending ? 'Submitting review...' : 'Submit review'}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    Sign in to rate this listing and share a review.
                  </div>
                )}

                <div className="space-y-3">
                  {isReviewsLoading ? (
                    <p className="text-sm text-slate-500">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-slate-500">No reviews yet.</p>
                  ) : (
                    reviews.map(review => (
                      <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{review.user?.name ?? 'Guest reviewer'}</p>
                            <p className="text-xs text-slate-500">{dayjs(review.createdAt).format('MMM D, YYYY')}</p>
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                            <FaStar aria-hidden="true" className="text-[#ffb020]" />
                            {review.rating.toFixed(1)}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{review.comment}</p>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
