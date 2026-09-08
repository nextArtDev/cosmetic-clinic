'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Reveal from './Reveal'
import { Instagram, Telegram, Whatsapp, ArrowLeft } from './Icons'
import { site } from '../lib/data'

const MENUS = [
  {
    category: 'کاوش',
    links: [
      { label: 'خدمات', href: '#treatments' },
      { label: 'دکترها', href: '#my-pick' },
      { label: 'نظر بیماران', href: '#reviews' },
      { label: 'کلینیک', href: '#store' },
    ],
  },
  {
    category: 'کلینیک',
    links: [
      { label: 'درباره ما', href: '#doctors' },
      { label: 'آدرس و ساعت', href: '#visit' },
      { label: 'کارتی هدیه', href: '#gift-cards' },
      { label: 'رزرو نوبت', href: '#book' },
    ],
  },
  {
    category: 'در تماس',
    links: [
      { label: 'ثبت درخواست', href: '#enquire' },
      { label: 'تماس با پشتیبانی', href: '#enquire' },
      { label: 'مسیر کلینیک', href: '#visit' },
    ],
  },
]

const SOCIALS = [
  { label: 'اینستاگرام', href: 'https://instagram.com', Icon: Instagram },
  { label: 'تلگرام', href: 'https://t.me', Icon: Telegram },
  { label: 'واتساپ', href: 'https://wa.me/989123456789', Icon: Whatsapp },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [note, setNote] = useState('')

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setState('loading')
    setNote('')
    try {
      const res = await fetch('/api/v6/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'ثبت‌نام ممکن نشد')
      setState('done')
      setNote('ثبت شد. خبرهای خوب در راه است.')
      setEmail('')
    } catch (err) {
      setState('error')
      setNote(err instanceof Error ? err.message : 'ثبت‌نام ممکن نشد')
    }
  }

  return (
    <footer
      id="store"
      className="relative overflow-hidden lk:bg-ink pb-[4rem] pt-[12rem] lk:text-cream"
    >
      <span
        aria-hidden
        className="blob-shape pointer-events-none absolute -top-[18rem] left-[-10rem] h-[52rem] w-[52rem] opacity-25"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(234,160,152,.55), rgba(35,31,32,0) 65%)',
        }}
      />

      <div className="container-wondr relative">
        {/* Newsletter */}
        <div className="grid grid-cols-1 gap-[3.2rem] border-b lk:border-cream/10 pb-[8rem] lg:grid-cols-12">
          <Reveal className="lg:col-span-5" y={30} x={0} skew={2}>
            <h3 className="lk:text-cream">نامه‌های سلامتی</h3>
            <p className="body-sm mt-[1.6rem] max-w-[40rem] lk:text-cream/55">
              گاه‌به‌گاه از دکترها — راهنمای سلامت ذهن، مقاله‌های علمی و خبرهای کلینیک.
              بدون اسپم، همیشه.
            </p>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.1} y={40} x={0} skew={2}>
              <form
                onSubmit={subscribe}
                className="flex flex-col gap-[2rem] sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor="newsletter"
                    className="block text-[1.1rem] font-bold lk:text-cream/45"
                  >
                    ایمیل شما
                  </label>
                  <input
                    id="newsletter"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="field mt-[0.6rem] lk:border-cream/20 lk:text-cream placeholder:text-cream/30"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={state === 'loading'}
                  data-cursor="cta"
                  className="btn-primary btn-primary--pink shrink-0 disabled:opacity-60"
                >
                  <span>{state === 'loading' ? 'در حال ثبت…' : 'عضویت'}</span>
                  <ArrowLeft color="#231F20" />
                </motion.button>
              </form>
              {note && (
                <p
                  className={`body-sm mt-[1.6rem] ${
                    state === 'error' ? 'text-[#ff9d94]' : 'lk:text-pink'
                  }`}
                >
                  {note}
                </p>
              )}
            </Reveal>
          </div>
        </div>

        {/* Menus */}
        <div className="grid grid-cols-1 gap-y-[6rem] py-[8rem] lg:grid-cols-12 lg:gap-x-[4rem]">
          <div className="lg:col-span-5">
            <Reveal y={40} x={0} skew={2}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img-v6/logo.svg"
                alt="سیمای آرام"
                className="h-[12rem] w-[12rem] object-contain"
              />
              <p className="display mt-[3.2rem] max-w-[38rem] text-[3rem] leading-[4.4rem] lk:text-cream/90">
                سلامتی یک حق است، نه امتیازی خاص.
              </p>
              <a
                href={site.phoneHref}
                className="mt-[2.4rem] inline-block text-[2rem] font-bold lk:text-pink underline-anim"
              >
                {site.phone}
              </a>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-y-[4rem] sm:grid-cols-3 lg:col-span-7">
            {MENUS.map((menu, mi) => (
              <Reveal key={menu.category} delay={0.1 + mi * 0.1} y={30} x={0} skew={2}>
                <span className="eyebrow block lk:text-cream/40">{menu.category}</span>
                <ul className="mt-[2.4rem] space-y-[1.2rem]">
                  {menu.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        data-cursor="view"
                        className="group relative inline-block text-[1.6rem] lk:text-cream/75 transition-colors duration-400 hover:lk:text-pink"
                      >
                        {link.label}
                        <span className="absolute -bottom-[2px] right-0 h-px w-full origin-left scale-x-0 lk:bg-pink transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:origin-right group-hover:scale-x-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Social */}
        <div className="flex flex-wrap items-center gap-[2rem] border-t lk:border-cream/10 py-[4.8rem]">
          <span className="eyebrow lk:text-cream/40">شبکه‌های اجتماعی</span>
          {SOCIALS.map(({ label, href, Icon }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              data-cursor="cta"
              whileHover={{ y: -4 }}
              className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-full ring-1 lk:ring-cream/20 lk:text-cream transition-colors duration-400 hover:lk:bg-pink hover:lk:text-ink hover:lk:ring-pink"
            >
              <Icon className="h-[1.8rem] w-[1.8rem]" />
            </motion.a>
          ))}
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-[2rem] border-t lk:border-cream/10 pt-[4rem] md:flex-row md:items-center md:justify-between">
          <p className="body-sm lk:text-cream/45">© کلینیک تخصصی سیمای آرام</p>
          <ul className="flex flex-wrap gap-x-[3.2rem] gap-y-[1.2rem]">
            {['تماس با ما', 'حریم خصوصی', 'قوانین و مقررات'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="body-sm lk:text-cream/60 transition-colors duration-400 hover:lk:text-pink"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
