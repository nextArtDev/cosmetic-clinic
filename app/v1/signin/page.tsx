import type { Metadata } from 'next'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'ورود | کلینیک ۴۰۴',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  return (
    <section className="mx-auto max-w-md px-6 pt-40 pb-28 md:pt-48">
      <SignInForm
        callbackUrl={
          typeof callbackUrl === 'string' ? callbackUrl : '/booking'
        }
      />
    </section>
  )
}
