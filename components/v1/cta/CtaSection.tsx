import Link from 'next/link'
import { CalendarCheck2, PhoneCall } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="v1-glass v1-shadow relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl px-6 py-12 text-center md:px-12">
        <h2 className="v1-title-gradient text-3xl font-black md:text-4xl">
          همین حالا نوبت خود را رزرو کنید
        </h2>
        <p className="max-w-lg text-sm font-medium text-black/70 md:text-base">
          انتخاب پزشک، زمان و مشخصات بیمار — در چند دقیقه نوبت بگیرید و از
          پرداخت امن آنلاین بهره‌مند شوید.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/v1/booking"
            className="flex items-center gap-2 rounded-xl bg-teal-800 px-7 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            <CalendarCheck2 size={18} />
            رزرو نوبت
          </Link>
          <a
            href="tel:06143228700"
            className="flex items-center gap-2 rounded-xl bg-black/70 px-7 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            <PhoneCall size={18} />
            تماس با کلینیک
          </a>
        </div>
      </div>
    </section>
  )
}
