import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import { useAuth } from '../../auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { FaArrowLeft, FaArrowRight, FaCheckCircle } from 'react-icons/fa'
import { bookingStep1Schema, bookingStep2Schema, bookingStep3Schema } from '../schemas/booking'
import type { BookingStep1Input, BookingStep2Input, BookingStep3Input } from '../schemas/booking'
import { useCreateBooking } from '../hooks/useCreateBooking'
import type { Listing } from '../../listings/types'

type BookingFormProps = {
  listing: Listing
  onBack: () => void
  onSuccess: () => void
}

type AllStepData = BookingStep1Input & BookingStep2Input & BookingStep3Input

const STEPS = ['Dates & Guests', 'Guest Info', 'Payment', 'Confirm']

export function BookingForm({ listing, onBack, onSuccess }: BookingFormProps) {
  const [step, setStep] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [accumulated, setAccumulated] = useState<Partial<AllStepData>>({})

  const createBooking = useCreateBooking(listing.id)
  const { user } = useAuth()

  const step1Form = useForm<BookingStep1Input>({
    resolver: zodResolver(bookingStep1Schema),
    defaultValues: { checkIn: '', checkOut: '', guests: 1 },
  })

  const step2Form = useForm<BookingStep2Input>({
    resolver: zodResolver(bookingStep2Schema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  const step3Form = useForm<BookingStep3Input>({
    resolver: zodResolver(bookingStep3Schema),
    defaultValues: { card: '', expiry: '', cvv: '' },
  })

  const nights = accumulated.checkIn && accumulated.checkOut
    ? Math.max(1, dayjs(accumulated.checkOut).diff(dayjs(accumulated.checkIn), 'day'))
    : 1
  const totalPrice = (listing.pricePerNight || listing.price) * nights

  const handleStep1 = step1Form.handleSubmit(data => {
    setAccumulated(prev => ({ ...prev, ...data }))
    if (user) {
      // Prefill guest info from profile and skip to payment
      setAccumulated(prev => ({ ...prev, name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '' }))
      setStep(2)
    } else {
      setStep(1)
    }
  })

  const handleStep2 = step2Form.handleSubmit(data => {
    setAccumulated(prev => ({ ...prev, ...data }))
    setStep(2)
  })

  const handleStep3 = step3Form.handleSubmit(data => {
    setAccumulated(prev => ({ ...prev, ...data }))
    setStep(3)
  })

  const handleConfirm = () => {
    const data = accumulated as AllStepData
    createBooking.mutate({
      listingId: listing.id,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      guestName: data.name,
      guestEmail: data.email,
      guestPhone: data.phone,
      cardNumber: data.card,
      cardExpiry: data.expiry,
      cardCvv: data.cvv,
      totalPrice,
      nights,
    } as any)
    
  }

  useEffect(() => {
    if (createBooking.isSuccess) {
      onSuccess()
    }
  }, [createBooking.isSuccess, onSuccess])

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setPhotoError('')
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File must be under 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    step2Form.setValue('profilePhoto', file, { shouldValidate: true })
  }

  return (
    <main className="bg-[#f7f4ef] pb-12 pt-8">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <button
          type="button"
          onClick={step === 0 ? onBack : () => setStep(s => s - 1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#ff4d2d]"
        >
          <FaArrowLeft aria-hidden="true" /> {step === 0 ? 'Back to listing' : 'Previous step'}
        </button>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-[#ff4d2d] text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i < step ? <FaCheckCircle aria-hidden="true" /> : i + 1}
              </div>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">{label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#ff4d2d]">Step {step + 1} of 4</p>
          <h2 className="mb-6 text-2xl font-black tracking-tight text-slate-900">{STEPS[step]}</h2>

          {/* Step 1 */}
          {step === 0 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <Field label="Check-in date" error={step1Form.formState.errors.checkIn?.message}>
                <input type="date" {...step1Form.register('checkIn')} className={inputCls(!!step1Form.formState.errors.checkIn)} />
              </Field>
              <Field label="Check-out date" error={step1Form.formState.errors.checkOut?.message}>
                <input type="date" {...step1Form.register('checkOut')} className={inputCls(!!step1Form.formState.errors.checkOut)} />
              </Field>
              <Field label="Number of guests" error={step1Form.formState.errors.guests?.message}>
                <input
                  type="number"
                  min={1}
                  max={16}
                  {...step1Form.register('guests', { valueAsNumber: true })}
                  className={inputCls(!!step1Form.formState.errors.guests)}
                />
              </Field>
              <SubmitBtn>Next <FaArrowRight aria-hidden="true" /></SubmitBtn>
            </form>
          )}

          {/* Step 2 */}
          {step === 1 && !user && (
            <form onSubmit={handleStep2} className="space-y-5">
                <Field label="Full name" error={step2Form.formState.errors.name?.message}>
                <input type="text" placeholder="Jane Doe" {...step2Form.register('name')} className={inputCls(!!step2Form.formState.errors.name)} />
              </Field>
              <Field label="Email address" error={step2Form.formState.errors.email?.message}>
                <input type="email" placeholder="jane@example.com" {...step2Form.register('email')} className={inputCls(!!step2Form.formState.errors.email)} />
              </Field>
              <Field label="Phone number" error={step2Form.formState.errors.phone?.message}>
                <input type="tel" placeholder="+1 555 000 0000" {...step2Form.register('phone')} className={inputCls(!!step2Form.formState.errors.phone)} />
              </Field>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Profile photo <span className="font-normal text-slate-400">(optional, max 5MB)</span></label>
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="mb-3 h-20 w-20 rounded-full object-cover ring-2 ring-[#ff4d2d]" />
                )}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#ff4d2d]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#ff4d2d]" />
                {photoError && <p className="mt-1 text-xs text-red-600">{photoError}</p>}
              </div>
              <SubmitBtn>Next <FaArrowRight aria-hidden="true" /></SubmitBtn>
            </form>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <form onSubmit={handleStep3} className="space-y-5">
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">This is a mock payment form. No real charges will be made.</p>
              <Field label="Card number (16 digits)" error={step3Form.formState.errors.card?.message}>
                <input type="text" maxLength={16} placeholder="1234567890123456" {...step3Form.register('card')} className={inputCls(!!step3Form.formState.errors.card)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expiry (MM/YY)" error={step3Form.formState.errors.expiry?.message}>
                  <input type="text" maxLength={5} placeholder="12/27" {...step3Form.register('expiry')} className={inputCls(!!step3Form.formState.errors.expiry)} />
                </Field>
                <Field label="CVV (3 digits)" error={step3Form.formState.errors.cvv?.message}>
                  <input type="text" maxLength={3} placeholder="123" {...step3Form.register('cvv')} className={inputCls(!!step3Form.formState.errors.cvv)} />
                </Field>
              </div>
              <SubmitBtn>Review booking <FaArrowRight aria-hidden="true" /></SubmitBtn>
            </form>
          )}

          {/* Step 4 — Confirmation */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3 text-sm">
                <SummaryRow label="Listing" value={listing.title} />
                <SummaryRow label="Location" value={listing.location} />
                <SummaryRow label="Check-in" value={accumulated.checkIn ?? ''} />
                <SummaryRow label="Check-out" value={accumulated.checkOut ?? ''} />
                <SummaryRow label="Nights" value={String(nights)} />
                <SummaryRow label="Guests" value={String(accumulated.guests)} />
                <SummaryRow label="Guest name" value={accumulated.name ?? ''} />
                <SummaryRow label="Email" value={accumulated.email ?? ''} />
                <div className="border-t border-slate-200 pt-3">
                  <SummaryRow label="Total price" value={`$${totalPrice}`} bold />
                </div>
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={createBooking.isPending}
                className="w-full rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)] transition hover:bg-[#ff5b3f] disabled:opacity-60"
              >
                {createBooking.isPending ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function SubmitBtn({ children }: { children: ReactNode }) {
  return (
    <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.18)] transition hover:bg-[#ff5b3f]">
      {children}
    </button>
  )
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={bold ? 'text-lg font-bold text-slate-900' : 'font-semibold text-slate-900'}>{value}</span>
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#ff4d2d]/30 ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-[#ff4d2d]'}`
}
