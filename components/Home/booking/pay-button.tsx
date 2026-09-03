'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { zarinpalPayment } from '@/lib/actions/payment'
import { cn } from '@/lib/utils'

const GRADIENT_PILL =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#30e8bf] via-[#e96f18] to-[#30e8bf] bg-[length:200%_auto] px-8 text-sm font-bold text-white shadow-lg shadow-black/25 transition-all duration-300 hover:bg-[position:right_center] hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100'

export function PayButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    if (loading) return
    setLoading(true)
    try {
      const result = await zarinpalPayment(appointmentId, 'home')
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
    <button onClick={handlePay} disabled={loading} className={cn(GRADIENT_PILL)}>
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" /> در حال اتصال به درگاه...
        </>
      ) : (
        'پرداخت و تأیید نوبت'
      )}
    </button>
  )
}
