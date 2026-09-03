import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { zarinpalPaymentApproval } from '@/lib/actions/payment'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const Authority = searchParams.get('Authority')
  const Status = searchParams.get('Status')
  const orderId = searchParams.get('orderId')
  const appointmentId = searchParams.get('appointmentId')
  // Which frontend initiated the payment: 'home' lands on root-level
  // /appointments/..., everything else keeps the /v1 result page.
  const flow = searchParams.get('flow')

  const resultURL = (appointmentId: string, query: Record<string, string>) => {
    const base =
      flow === 'home'
        ? `/appointments/${appointmentId}`
        : `/v1/appointments/${appointmentId}`
    const url = new URL(base, request.url)
    for (const [k, v] of Object.entries(query)) {
      if (v) url.searchParams.set(k, v)
    }
    return url.toString()
  }

  try {
    if (!Authority || !Status || !appointmentId || !orderId) {
      return NextResponse.redirect(
        resultURL(appointmentId ?? '', { error: 'invalid_params' }),
      )
    }

    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.redirect(new URL('/signin', request.url).toString())
    }

    const result = await zarinpalPaymentApproval({
      appointmentId,
      orderId,
      Authority,
      Status,
    })

    if (result?.errors?._form?.[0]) {
      return NextResponse.redirect(
        resultURL(appointmentId, { error: encodeURIComponent(result.errors._form[0]) }),
      )
    }

    if (result?.success) {
      return NextResponse.redirect(
        resultURL(
          appointmentId,
          result.alreadyPaid
            ? { status: 'already_paid' }
            : { status: 'success' },
        ),
      )
    }

    return NextResponse.redirect(
      resultURL(appointmentId, { error: 'payment_failed' }),
    )
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(
      resultURL(appointmentId ?? '', { error: 'server_error' }),
    )
  }
}
