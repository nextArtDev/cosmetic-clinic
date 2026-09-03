import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '../../components/motion/reveal'

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-28">
      <Reveal>
        <div className="glass-panel relative overflow-hidden px-8 py-16 text-center md:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-[110px]" />
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
            هر زمان که آماده باشید
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ivory md:text-5xl">
            نوبت بعدی شما فقط{' '}
            <span className="italic text-gradient-gold">
              چند دقیقه فاصله دارد.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm text-ivory-dim">
            پزشک، بیماری یا نزدیک‌ترین ساعت خالی را انتخاب کنید — تأیید نوبت
            آنی است.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/v1/booking" className="flex items-center gap-2">
              رزرو نوبت <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
