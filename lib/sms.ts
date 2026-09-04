import 'server-only'

import { DEMO_MODE } from './demo'

const MELI_PAYAMAK_ENDPOINT =
  'https://rest.payamak-panel.com/api/SendSMS/SendOtp'

interface SendResult {
  ok: boolean
  error?: string
}

/**
 * Sends an OTP verification code via Meli Payamak.
 * In demo mode no SMS is sent at all (the OTP is forced to 123456 in auth).
 * In development the code is only logged to the server console (no credit used).
 * In production it calls the Meli Payamak SendOtp REST endpoint.
 */
export async function sendOtpSms(
  phoneNumber: string,
  code: string,
): Promise<SendResult> {
  if (DEMO_MODE) {
    console.log(`[otp-demo] code for ${phoneNumber}: ${code} (not sent)`)
    return { ok: true }
  }

  console.log(`[otp-dev] code for ${phoneNumber}: ${code}`)

  if (!phoneNumber) return { ok: false, error: 'NO_PHONE' }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[otp-dev] code for ${phoneNumber}: ${code}`)
    return { ok: true }
  }

  const username = process.env.MELI_PAYAMAK_USERNAME
  const password = process.env.MELI_PAYAMAK_PASSWORD
  const from = process.env.MELI_PAYAMAK_FROM

  if (!username || !password || !from) {
    console.error('[otp] missing Meli Payamak credentials in env')
    return { ok: false, error: 'MISSING_CREDENTIALS' }
  }

  try {
    const body = new URLSearchParams({
      username,
      password,
      from,
      to: phoneNumber,
      code,
    })

    const res = await fetch(MELI_PAYAMAK_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error(
        '[otp] Meli Payamak http error',
        res.status,
        await res.text(),
      )
      return { ok: false, error: 'PROVIDER_ERROR' }
    }

    const data = (await res.json()) as { RetStatus?: number; Value?: string }
    const retStatus = data.RetStatus ?? Number(data.Value)

    if (retStatus > 0) {
      return { ok: true }
    }

    console.error('[otp] Meli Payamak send failed', JSON.stringify(data))
    return { ok: false, error: 'PROVIDER_REJECTED' }
  } catch (e) {
    console.error('[otp] send failed', { phoneNumber, error: e })
    return { ok: false, error: e instanceof Error ? e.message : 'UNKNOWN' }
  }
}
