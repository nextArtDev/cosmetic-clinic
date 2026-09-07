'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from './Reveal'
import { ArrowLeft, Star } from './Icons'
import { site } from '../lib/data'

const INTERESTS = [
  'اکوکاردیوگرافی',
  'آنژیوگرافی',
  'هولتر ریتم قلب',
  'پزشکی ورزشی قلب',
  'آرتروسکوپی',
  'تعویض مفصل زانو',
  'ستون فقرات',
  'مشاوره عمومی',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function EnquiryForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [interest, setInterest] = useState(INTERESTS[0])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/v6/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          interest,
          message: data.get('message'),
        }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'خطایی رخ داد')
      setStatus('success')
      setMessage('ممنون — تیم درنا طب در یک روز کاری با شما تماس می‌گیرد.')
      form.reset()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'خطایی رخ داد')
    }
  }

  return (
    <section id="enquire" className="component overflow-hidden lk:bg-ink lk:text-cream">
      <div className="container-wondr">
        <div className="grid grid-cols-1 gap-y-[6rem] lg:grid-cols-12 lg:gap-x-[6rem]">
          {/* Right copy (inline-start) */}
          <div className="lg:col-span-5">
            <Reveal y={30} x={0} skew={2}>
              <span className="block text-[1.2rem] font-bold lk:text-pink">
                در تماس باشیم
              </span>
            </Reveal>
            <Reveal delay={0.1} y={50} x={0} skew={3}>
              <h2 className="mt-[2rem] lk:text-cream">ثبت درخواست نوبت</h2>
            </Reveal>
            <Reveal delay={0.2} y={40} x={0} skew={2}>
              <p className="body-sm mt-[2.4rem] max-w-[46rem] lk:text-cream/60">
                کمی از شرایط‌تان برایمان بنویسید. هر درخواست شخصاً توسط دکترها خوانده می‌شود و
                با صادقانه‌ترین توصیه پاسخ داده می‌شود — بدون فروش فشار.
              </p>

              <div className="mt-[4rem] space-y-[2rem]">
                <div>
                  <span className="block text-[1.2rem] font-bold lk:text-cream/45">
                    کلینیک
                  </span>
                  <p className="body-sm mt-[0.8rem] lk:text-cream/80">{site.address}</p>
                </div>
                <div>
                  <span className="block text-[1.2rem] font-bold lk:text-cream/45">
                    ساعت کاری
                  </span>
                  <p className="body-sm num mt-[0.8rem] lk:text-cream/80">
                    شنبه تا چهارشنبه · ۹:۰۰ – ۱۹:۰۰
                    <br />
                    پنجشنبه · ۹:۰۰ – ۱۴:۰۰
                  </p>
                </div>
                <div className="flex items-center gap-[1.2rem] pt-[1rem]">
                  <span className="star-row">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} />
                    ))}
                  </span>
                  <span className="body-sm lk:text-cream/70">
                    ۵.۰ · بیش از ۴۸۰ نظر ثبت‌شده
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.15} y={50} x={0} skew={3}>
              <form
                onSubmit={onSubmit}
                className="rounded-[3rem] lk:bg-cream/[0.04] p-[2.4rem] ring-1 lk:ring-cream/10 backdrop-blur md:p-[4.8rem]"
              >
                <div className="grid grid-cols-1 gap-[2.4rem] md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[1.1rem] font-bold lk:text-cream/45"
                    >
                      نام و نام خانوادگی
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      className="field mt-[0.6rem] lk:border-cream/20 lk:text-cream placeholder:text-cream/30"
                      placeholder="نام شما"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-[1.1rem] font-bold lk:text-cream/45"
                    >
                      شماره تماس
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      required
                      className="field mt-[0.6rem] lk:border-cream/20 lk:text-cream placeholder:text-cream/30"
                      placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[1.1rem] font-bold lk:text-cream/45"
                    >
                      ایمیل (اختیاری)
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="field mt-[0.6rem] lk:border-cream/20 lk:text-cream placeholder:text-cream/30"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <span className="block text-[1.1rem] font-bold lk:text-cream/45">
                      موضوع درخواست
                    </span>
                    <div className="mt-[0.8rem] flex flex-wrap gap-[0.8rem]">
                      {INTERESTS.map((item) => {
                        const active = interest === item
                        return (
                          <button
                            key={item}
                            type="button"
                            data-cursor="view"
                            onClick={() => setInterest(item)}
                            className={`rounded-full border px-[1.6rem] py-[0.8rem] text-[1.2rem] font-bold transition-all duration-400 ${
                              active
                                ? 'lk:border-pink lk:bg-pink lk:text-ink'
                                : 'lk:border-cream/20 lk:text-cream/70 hover:lk:border-pink hover:lk:text-pink'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-[2.4rem]">
                  <label
                    htmlFor="message"
                    className="block text-[1.1rem] font-bold lk:text-cream/45"
                  >
                    توضیحات
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="field mt-[0.6rem] resize-none lk:border-cream/20 lk:text-cream placeholder:text-cream/30"
                    placeholder="شرح کوتاهی از شرایط یا سؤال‌تان…"
                  />
                </div>

                <div className="mt-[3.2rem] flex flex-wrap items-center gap-[2rem]">
                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    data-cursor="cta"
                    className="btn-primary btn-primary--pink disabled:opacity-60"
                  >
                    <span>{status === 'loading' ? 'در حال ارسال…' : 'ارسال درخواست'}</span>
                    <ArrowLeft color="#231F20" />
                  </motion.button>

                  <AnimatePresence>
                    {message && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`body-sm max-w-[32rem] ${
                          status === 'error' ? 'text-[#ff9d94]' : 'lk:text-pink'
                        }`}
                      >
                        {message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
