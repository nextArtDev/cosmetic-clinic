import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
        ۴۰۴
      </p>
      <h1 className="mt-4 font-display text-4xl text-ivory md:text-5xl">
        صفحه پیدا نشد
      </h1>
      <p className="mt-4 max-w-sm text-sm text-ivory-dim">
        صفحه‌ای که به دنبال آن هستید وجود ندارد یا شاید جابه‌جا شده است.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/v1">بازگشت به خانه</Link>
      </Button>
    </section>
  )
}
