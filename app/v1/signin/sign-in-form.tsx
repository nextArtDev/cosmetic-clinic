'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, Smartphone, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

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

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0')) return `+98${digits.slice(1)}`
    return `+${digits}`
  }

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
      const res = await verifyOtp(
        normalizePhone(phoneNumber),
        code.trim(),
      )
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
    <div className="glass-panel p-8 md:p-10">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-sage-mist">
          <ShieldCheck size={26} />
        </span>
        <h1 className="mt-6 font-display text-3xl text-ivory">
          ورود به کلینیک ۴۰۴
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          بدون رمز عبور؛ با شمارهٔ موبایل و کد تأیید پیامکی وارد شوید.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {step === 'phone' ? (
          <label className="block">
            <span className="text-xs text-ivory-dim">شماره موبایل</span>
            <div className="relative mt-2">
              <Smartphone
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ivory-dim"
              />
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendOtp()
                }}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                inputMode="tel"
                className="w-full rounded-xl border border-glass-border bg-transparent py-3 pr-10 pl-4 text-sm text-ivory placeholder:text-ivory-dim/50 outline-none focus-visible:border-gold"
              />
            </div>
          </label>
        ) : (
          <label className="block">
            <span className="text-xs text-ivory-dim">
              کد تأیید ارسال‌شده به {phoneNumber}
            </span>
            <div className="relative mt-2">
              <KeyRound
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ivory-dim"
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
                className="w-full rounded-xl border border-glass-border bg-transparent py-3 pr-10 pl-4 text-center font-mono text-lg tracking-[0.4em] text-ivory placeholder:text-ivory-dim/50 outline-none focus-visible:border-gold"
              />
            </div>
          </label>
        )}

        {step === 'phone' ? (
          <Button
            size="lg"
            className="w-full"
            onClick={sendOtp}
            disabled={sending}
          >
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> در حال ارسال کد...
              </>
            ) : (
              'ارسال کد تأیید'
            )}
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              className="w-full"
              onClick={verify}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> در حال ورود...
                </>
              ) : (
                'ورود به حساب'
              )}
            </Button>
            <div className="text-center">
              <button
                onClick={sendOtp}
                disabled={sending || cooldown > 0}
                className="text-xs text-ivory-dim underline-offset-4 hover:text-ivory hover:underline disabled:cursor-not-allowed"
              >
                {cooldown > 0
                  ? `ارسال مجدد کد تا ${cooldown} ثانیه دیگر`
                  : 'ارسال مجدد کد'}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-ivory-dim">
        با ورود به سایت، <span className="text-ivory">قوانین و مقررات</span>{' '}
        کلینیک را می‌پذیرید.
      </p>
    </div>
  )
}
