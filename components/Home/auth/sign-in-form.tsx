'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { MobileNumberInput } from '@/components/ui/mobile-number-input'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const GRADIENT_PILL =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#30e8bf] via-[#e96f18] to-[#30e8bf] bg-[length:200%_auto] px-8 text-sm font-bold text-white shadow-lg shadow-black/25 transition-all duration-300 hover:bg-[position:right_center] hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100'

type OtpResult = {
  data: { status: boolean } | null
  error: { message?: string } | string | null
}

const requestOtp = async (phoneNumber: string): Promise<OtpResult> => {
  const fn = authClient.phoneNumber.sendOtp as unknown as (opts: {
    phoneNumber: string
  }) => Promise<OtpResult>
  return fn({ phoneNumber })
}

const verifyOtp = async (
  phoneNumber: string,
  code: string,
): Promise<OtpResult> => {
  const fn = authClient.phoneNumber.verify as unknown as (opts: {
    phoneNumber: string
    code: string
  }) => Promise<OtpResult>
  return fn({ phoneNumber, code })
}

const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return `+98${digits.slice(1)}`
  return `+${digits}`
}

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  async function sendOtp() {
    const normalized = normalizePhone(phoneNumber)
    if (normalized.length < 12) {
      toast.error('شماره موبایل معتبر نیست.')
      return
    }
    setSending(true)
    try {
      const res = await requestOtp(normalized)
      const message =
        typeof res.error === 'string' ? res.error : res.error?.message
      if (res.error) {
        toast.error(message ?? 'ارسال کد با مشکل مواجه شد.')
        return
      }
      setStep('code')
      toast.info('کد تأیید برای شما ارسال شد.')
      let left = 120
      setCooldown(left)
      const timer = setInterval(() => {
        left -= 1
        setCooldown(left)
        if (left <= 0) clearInterval(timer)
      }, 1000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطا در ارسال کد.'
      toast.error(msg)
    } finally {
      setSending(false)
    }
  }

  async function verify() {
    if (code.trim().length < 4) {
      toast.error('کد تأیید را وارد کنید.')
      return
    }
    setVerifying(true)
    try {
      const res = await verifyOtp(normalizePhone(phoneNumber), code.trim())
      if (res.error) {
        const message =
          typeof res.error === 'string' ? res.error : res.error?.message
        toast.error(message ?? 'کد تأیید صحیح نیست.')
        return
      }
      toast.success('خوش آمدید!')
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در ورود.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-white/60 bg-white/90 p-8 text-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-10">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#30e8bf] to-[#e96f18] text-white shadow-lg shadow-black/20">
          <ShieldCheck size={26} />
        </span>
        <h1 className="mt-6 text-3xl font-bold">
          ورود به کلینیک دکتر شبنم فضلی
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          بدون رمز عبور؛ با شمارهٔ موبایل و کد تأیید پیامکی وارد شوید.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {step === 'phone' ? (
          <label className="block">
            <span className="mb-2 block text-xs text-neutral-500">
              شماره موبایل
            </span>
            <MobileNumberInput
              value={phoneNumber}
              onValueChange={setPhoneNumber}
              placeholder="0912 345 6789"
              className="h-12 rounded-xl border border-neutral-200 shadow-none"
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-xs text-neutral-500">
              کد تأیید ارسال‌شده به {phoneNumber}
            </span>
            <div className="relative mt-2">
              <KeyRound
                size={16}
                className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-neutral-400"
              />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') verify()
                }}
                placeholder="••••••"
                dir="ltr"
                inputMode="numeric"
                maxLength={6}
                className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 text-center font-mono text-lg tracking-[0.4em] outline-none transition-colors placeholder:text-neutral-400 focus-visible:border-[#30e8bf]"
              />
            </div>
          </label>
        )}

        {step === 'phone' ? (
          <button
            onClick={sendOtp}
            disabled={sending}
            className={cn(GRADIENT_PILL)}
          >
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> در حال ارسال
                کد...
              </>
            ) : (
              'ارسال کد تأیید'
            )}
          </button>
        ) : (
          <>
            <button
              onClick={verify}
              disabled={verifying}
              className={cn(GRADIENT_PILL)}
            >
              {verifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> در حال ورود...
                </>
              ) : (
                'ورود به حساب'
              )}
            </button>
            <div className="text-center">
              <button
                onClick={sendOtp}
                disabled={sending || cooldown > 0}
                className="text-xs text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline disabled:cursor-not-allowed"
              >
                {cooldown > 0
                  ? `ارسال مجدد کد تا ${cooldown} ثانیه دیگر`
                  : 'ارسال مجدد کد'}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-neutral-500">
        با ورود به سایت،{' '}
        <span className="font-semibold text-neutral-900">قوانین و مقررات</span>{' '}
        کلینیک را می‌پذیرید.
      </p>
    </div>
  )
}
