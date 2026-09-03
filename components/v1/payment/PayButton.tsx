'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { zarinpalPayment } from '@/lib/actions/payment'

export function PayButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    if (loading) return
    setLoading(true)
    try {
      const result = await zarinpalPayment(appointmentId)
      if (result.payment?.url) {
        window.location.href = result.payment.url
        return
      }
      const message =
        result.errors?._form?.[0] ?? 'خطا در ایجاد درخواست پرداخت.'
      toast.error(message)
      setLoading(false)
    } catch {
      toast.error('خطایی رخ داد، لطفاً دوباره تلاش کنید.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" /> در حال اتصال به
          درگاه...
        </>
      ) : (
        'پرداخت و تأیید نوبت'
      )}
    </button>
  )
}
