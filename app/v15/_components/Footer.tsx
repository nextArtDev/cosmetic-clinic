'use client'

import { useState, type FormEvent } from 'react'
import { ArrowUp, ArrowLeft, ShieldCheck, Truck, Gem } from 'lucide-react'
import { useV15 } from '../_lib/store'
import { getLenis } from '../_lib/lenis'
import { faDigits } from '../_lib/format'
import { FadeUp } from './Reveal'
import Magnetic from './Magnetic'
import { InstagramIcon, TelegramIcon, AparatIcon } from './SocialIcons'

const COLS: { title: string; links: string[] }[] = [
  { title: 'کالکشن‌ها', links: ['سرو', 'ماه‌تاب', 'نگین', 'کویر'] },
  {
    title: 'خدمات',
    links: ['مُهرِ گرم و حکاکی', 'نگهداری و بازسازی چرم', 'بوتیک‌ها', 'پاسخ به پرسش‌ها'],
  },
  { title: 'خانه‌ی راگا', links: ['از ۱۳۰۴', 'صنعتگری', 'روایت‌ها', 'همکاری با ما'] },
]

const TRUST = [
  { icon: ShieldCheck, label: 'پرداختِ امن از درگاهِ شتاب' },
  { icon: Truck, label: 'ارسالِ بیمه‌شده به سراسرِ ایران' },
  { icon: Gem, label: 'ضمانتِ مادام‌العمرِ دوخت' },
]

export default function Footer() {
  const { toast } = useV15()
  const [email, setEmail] = useState('')

  const subscribe = (e: FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      toast('نشانیِ ایمیل معتبر نیست', 'لطفاً دوباره تلاش کنید.')
      return
    }
    setEmail('')
    toast('به خانه‌ی راگا خوش آمدید', 'عضویتِ شما در خبرنامه ثبت شد (نمایشی).')
  }

  const backToTop = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1.8 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="v15-bg-ink relative overflow-hidden text-[color:var(--v15-paper)]">
      {/* top CTA strip */}
      <div className="grid grid-cols-1 gap-10 border-b border-white/10 px-5 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <div>
          <FadeUp>
            <p className="mb-4 text-xs tracking-[0.25em] opacity-60">
              خبرنامه‌ی کارگاه
            </p>
            <h2 className="max-w-md text-3xl font-extralight leading-[1.7] md:text-5xl md:leading-[1.6]">
              از تازه‌های کارگاه، نخست باخبر شوید
            </h2>
          </FadeUp>
        </div>

        <FadeUp delay={0.1} className="flex items-end">
          <form onSubmit={subscribe} className="w-full max-w-md">
            <label htmlFor="v15-news" className="mb-3 block text-sm font-light opacity-80">
              نشانیِ ایمیل شما
            </label>
            <div className="flex items-center gap-3 border-b border-white/30 pb-3 transition-colors focus-within:border-[color:var(--v15-caramel)]">
              <input
                id="v15-news"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-left text-sm font-light tracking-wide outline-none placeholder:text-white/30"
              />
              <button
                type="submit"
                data-cursor="hover"
                className="group flex shrink-0 items-center gap-2 text-sm font-light"
              >
                عضویت
                <ArrowLeft
                  className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1"
                  strokeWidth={1.5}
                />
              </button>
            </div>
            <p className="mt-3 text-[11px] font-light leading-6 opacity-50">
              با عضویت، روایت‌های کارگاه و گشایشِ کالکشن‌های تازه برایتان ارسال می‌شود.
            </p>
          </form>
        </FadeUp>
      </div>

      {/* link columns */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 px-5 py-14 md:grid-cols-4 md:px-10 md:py-20">
        <div className="col-span-2 md:col-span-1">
          <p className="text-2xl font-light">
            مِزون <span className="v15-latin tracking-[0.18em]">RĀGĀ</span>
          </p>
          <p className="mt-4 max-w-52 text-xs font-light leading-7 opacity-60">
            قدیمی‌ترین خانه‌ی چرمِ دست‌دوزِ ایران — از ۱۳۰۴ خورشیدی. (دموی نمایشی)
          </p>
          <div className="mt-6 flex items-center gap-3">
            {[
              { icon: InstagramIcon, label: 'اینستاگرام' },
              { icon: TelegramIcon, label: 'تلگرام' },
              { icon: AparatIcon, label: 'آپارات' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                data-cursor="hover"
                onClick={() => toast(label, 'پیوندِ شبکه‌های اجتماعی — نسخه‌ی نمایشی')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors duration-300 hover:bg-[color:var(--v15-paper)] hover:text-[color:var(--v15-ink)]"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
{COLS.map((col) => (
          <div key={col.title}>
            <p className="mb-5 text-xs tracking-[0.25em] opacity-50">{col.title}</p>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    data-cursor="hover"
                    onClick={() => toast(link, 'صفحه‌ی داخلی — نسخه‌ی نمایشی')}
                    className="v15-uline text-sm font-light opacity-80 hover:opacity-100"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* trust row */}
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-white/10 px-5 py-8 md:px-10">
        {TRUST.map(({ icon: Icon, label }) => (
          <p key={label} className="flex items-center gap-2.5 text-xs font-light opacity-70">
            <Icon className="h-4 w-4" strokeWidth={1.4} />
            {label}
          </p>
        ))}
        <div className="ms-auto">
          <Magnetic strength={0.4}>
            <button
              type="button"
              data-cursor="hover"
              onClick={backToTop}
              aria-label="بازگشت به بالا"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors duration-300 hover:bg-[color:var(--v15-paper)] hover:text-[color:var(--v15-ink)]"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={1.4} />
            </button>
          </Magnetic>
        </div>
      </div>

      {/* ghost wordmark */}
      <div aria-hidden className="pointer-events-none select-none px-5 md:px-10">
        <p className="v15-ghost whitespace-nowrap text-center text-[24vw] font-thin leading-[0.9] md:text-[19vw]">
          راگا
        </p>
      </div>

      {/* legal line */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-5 text-[11px] font-light opacity-50 md:px-10">
        <p>
          © {faDigits(1403)} مِزون راگا — تمامی داده‌ها نمایشی (Mock) و آماده‌ی اتصال به Prisma است.
        </p>
        <p className="v15-latin tracking-[0.25em]">TEHRAN — PARIS OF THE EAST</p>
      </div>
    </footer>
  )
}