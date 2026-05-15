import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { refreshAppData, useApiMutation } from '../../../shared/hooks/useApiState'

type PayVars = { bookingId: string; amount: number }
type MtnPaymentResponse = { payment: any; providerResp: any }

/**
 * Hook to initiate MTN payment for a confirmed booking.
 * Calls /api/v1/payments/mtn/initiate endpoint.
 */
export function usePayForBooking() {
  return useApiMutation<MtnPaymentResponse, PayVars, Error>(
    async (vars: PayVars) => {
      const response = await api.post<MtnPaymentResponse>(`/payments/mtn/initiate`, {
        bookingId: vars.bookingId,
        amount: vars.amount,
      })
      return response
    },
    {
      onSuccess: (data) => {
        refreshAppData('bookings')
        const checkoutUrl = data.providerResp?.checkoutUrl
        if (checkoutUrl) {
          toast.success('Redirecting to MTN payment...')
          // Open MTN checkout in new window or redirect
          setTimeout(() => {
            window.open(checkoutUrl, '_blank')
          }, 500)
        } else {
          toast.success('Payment initiated successfully')
        }
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Payment initiation failed')
      },
    },
  )
}
