/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BRAND, NAV_LINKS } from '../lib/content'
import PlusIcon from './plus-icon'

const SOCIALS = [
  { href: 'https://instagram.com', icon: '/v11/img/icons/instagram.svg', label: 'اینستاگرام' },
  { href: 'https://youtube.com', icon: '/v11/img/icons/youtube.svg', label: 'یوتیوب' },
  { href: 'https://x.com', icon: '/v11/img/icons/x.svg', label: 'ایکس' },
]

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="slide-link">
      <span>{label}</span>
      <span aria-hidden>{label}</span>
    </a>
  )
}

export default function Footer() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setStatus('loading')
    try {
      const res = await fetch('/v11/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email') }),
      })
      const json = (await res.json()) as { ok: boolean; error?: string }
      if (!json.ok) throw new Error(json.error ?? 'خطا')
      setStatus('done')
      setMessage('به فهرست خبرنامه اضافه شدید.')
      form.reset()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'مشکلی پیش آمد')
    }
  }

  return (
    <footer className="scmd:relative scmd:w-full" style={{ height: '22.5em' }}>
      <div className="container scmd:relative scmd:h-full">
        <div className="side-lines">
          <span className="line-vertical beige scmd:block" />
          <span className="line-vertical beige scmd:block" />
        </div>

        <div
          className="scmd:relative scmd:flex scmd:w-full scmd:flex-col scmd:md:flex-row"
          style={{ borderTop: '0.5px solid rgba(205,160,127,0.5)', height: '100%' }}
        >
          <img
            src="/v11/img/decor/decor-1.svg"
            alt=""
            className="scmd:absolute"
            style={{ width: '0.88em', height: '0.88em', right: '0.6em', top: '-0.5em' }}
          />
          <img
            src="/v11/img/decor/decor-3.svg"
            alt=""
            className="scmd:absolute"
            style={{ width: '0.88em', height: '0.88em', left: '0.6em', top: '-0.45em' }}
          />

          <div className="footer-left">
            <div className="scmd:flex scmd:w-full scmd:flex-col scmd:items-start scmd:justify-between scmd:md:flex-row" style={{ gap: '2em' }}>
              <div className="footer-lins-wrap">
                <img
                  src="/v11/img/dark-logo.svg"
                  alt={BRAND.name}
                  style={{ width: '11.13em' }}
                />
                <div className="scmd:flex scmd:flex-col" style={{ gap: '0.5em' }}>
                  {NAV_LINKS.map((l) => (
                    <FooterLink key={l.href} label={l.label} href={l.href} />
                  ))}
                </div>
              </div>

              <div className="follow-us-wrap">
                <div className="awesome-37">ما را دنبال کنید:</div>
                <div className="scmd:flex" style={{ gap: '0.63em' }}>
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="social-btn"
                    >
                      <img
                        src={s.icon}
                        alt=""
                        style={{ width: '0.94em', height: '0.94em' }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="legacy-links scmd:mt-[2em] scmd:md:mt-0">
              <FooterLink label="شرایط استفاده" href="#top" />
              <FooterLink label="سیاست حفظ حریم خصوصی" href="#top" />
              <span className="text-14-regular" style={{ opacity: 0.6 }}>
                © {new Date().getFullYear()} {BRAND.name} — کلیه حقوق محفوظ است.
              </span>
            </div>
          </div>

          <div className="footer-right">
            <div className="scmd:flex scmd:flex-col" style={{ gap: '1em' }}>
              <div className="form-heading text-16-regular black">
                تازه‌ترین امکانات و به‌روزرسانی‌های {BRAND.name} را دریافت کنید:
              </div>

              <form
                className="scmd:flex scmd:w-full scmd:items-start"
                style={{ gap: '0.63em' }}
                onSubmit={submit}
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ایمیل شما"
                  className="text-field"
                  aria-label="ایمیل شما"
                  dir="ltr"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="scmd:flex scmd:items-center scmd:justify-center scmd:whitespace-nowrap scmd:transition-opacity disabled:scmd:opacity-60"
                  style={{
                    gap: '0.5em',
                    backgroundColor: 'var(--pink)',
                    color: '#fff',
                    borderRadius: '0.13em',
                    height: '2.9em',
                    padding: '0 1.25em',
                    fontSize: '0.88em',
                  }}
                >
                  {status === 'loading' ? 'در حال ارسال…' : 'عضویت'}
                  <PlusIcon />
                </button>
              </form>

              <div style={{ minHeight: '1.6em' }}>
                <AnimatePresence mode="wait">
                  {(status === 'done' || status === 'error') && (
                    <motion.p
                      key={status}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-14-regular"
                      style={{ color: status === 'error' ? '#e0113f' : 'var(--pink)' }}
                    >
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-9-regular text-under-form" style={{ opacity: 0.6 }}>
                با ارسال این فرم، موافق دریافت ایمیل‌های خبری از {BRAND.name} خواهید شد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
