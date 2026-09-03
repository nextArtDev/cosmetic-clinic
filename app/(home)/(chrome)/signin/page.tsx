import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import { SignInForm } from '@/components/Home/auth/sign-in-form'
import { FlowShell } from '@/components/Home/booking/flow-shell'

export const metadata: Metadata = {
  title: 'ورود | کلینیک دکتر نگین فضلی',
  description:
    'ورود به حساب کاربری کلینیک دکتر نگین فضلی؛ بدون رمز عبور و فقط با کد تأیید پیامکی.',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  return (
    <ViewTransition
      name="page"
      share="page-wipe"
      enter="page-wipe"
      exit="page-wipe"
      default="none"
    >
      <FlowShell
        eyebrow="ورود به حساب"
        title="خوش آمدید."
        description="برای رزرو نوبت، پیگیری ویزیت‌ها و ثبت دیدگاه وارد شوید."
      >
        <SignInForm
          callbackUrl={typeof callbackUrl === 'string' ? callbackUrl : '/'}
        />
      </FlowShell>
    </ViewTransition>
  )
}
