import Link from 'next/link'
import { getSpecializations } from '../../lib/data'
import { Separator } from '@/components/ui/separator'

export async function Footer() {
  const specializations = await getSpecializations()

  return (
    <footer className="border-t border-glass-border bg-ink-soft">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/v1" className="font-display text-2xl">
              کلینیک ۴۰۴
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory-dim">
              کلینیک تخصصی خصوصی با رویکرد معاینات بدون عجله، پنج پزشک متخصص و
              تیمی از دوازده کادر مراقبت — برای بیمارانی که به وقت و توجه خود
              اهمیت می‌دهند.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
              تخصص‌ها
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory-dim">
              {specializations.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/v1/specializations/${s.slug}`}
                    className="hover:text-ivory"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
              کلینیک
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory-dim">
              <li>
                <Link href="/v1/doctors" className="hover:text-ivory">
                  پزشکان ما
                </Link>
              </li>
              <li>
                <Link href="/v1/illnesses" className="hover:text-ivory">
                  بیماری‌های تحت درمان
                </Link>
              </li>
              <li>
                <Link href="/v1/booking" className="hover:text-ivory">
                  رزرو نوبت
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="flex flex-col items-start justify-between gap-4 text-xs text-ivory-dim/70 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} کلینیک ۴۰۴. تمامی حقوق محفوظ است.</p>
          <p className="font-mono">خیابان اشورث ۱۹ · شنبه تا پنجشنبه، ۰۸:۰۰ تا ۱۸:۰۰</p>
        </div>
      </div>
    </footer>
  )
}
