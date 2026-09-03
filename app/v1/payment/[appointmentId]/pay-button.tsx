'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
    <Button size="lg" className="w-full" onClick={handlePay} disabled={loading}>
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" /> در حال اتصال به درگاه...
        </>
      ) : (
        'پرداخت و تأیید نوبت'
      )}
    </Button>
  )
}
