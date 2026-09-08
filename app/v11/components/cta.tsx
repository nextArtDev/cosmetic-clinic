/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BOOK_LINK, CTA as CTA_CONTENT } from '../lib/content'
import WordReveal from './word-reveal'
import PlusIcon from './plus-icon'
import Magnetic from './magnetic'
import ClipReveal from './clip-reveal'

export default function CTA({ initialCount = 0 }: { initialCount?: number }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [total, setTotal] = useState(initialCount)

  const toFa = (n: number) => n.toLocaleString('fa-IR')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setStatus('loading')
    try {
      const res = await fetch('/v11/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          clinic: data.get('clinic'),
          phone: data.get('phone'),
          screens: Number(data.get('screens') || 1),
        }),
      })
      const json = (await res.json()) as {
        ok: boolean
        total?: number
        error?: string
      }
      if (!json.ok) throw new Error(json.error ?? 'خطا')
      setTotal(json.total ?? total + 1)
      setStatus('done')
      setMessage('سپاس! حداکثر تا یک روز کاری با شما تماس می‌گیریم.')
      form.reset()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'مشکلی پیش آمد')
    }
  }

  return (
    <section id="cta" className="scmd:relative scmd:w-full">
      <div className="container scmd:relative">
        <div className="scmd:relative scmd:grid scmd:grid-cols-1 scmd:md:grid-cols-2">
          <div className="side-lines">
            <span className="line-vertical beige scmd:block" />
            <span className="line-vertical beige scmd:block" />
          </div>

          <ClipReveal className="scmd:order-2 scmd:md:order-1">
            <img src="/v11/img/cta.avif" alt="" className="cta-photo" />
          </ClipReveal>

          <div className="cta-text scmd:relative scmd:order-1 scmd:md:order-2">
            <div className="cta-heading">
              <WordReveal
                as="h2"
                className="h2-style black last-text"
                parts={CTA_CONTENT.title}
              />
            </div>

            <Magnetic>
              <a href={BOOK_LINK} className="btn-black">
                <span>رزرو دمو</span>
                <PlusIcon />
              </a>
            </Magnetic>

            <div className="scmd:w-full">
              <div
                className="form-heading text-16-regular black"
                style={{ maxWidth: '26em' }}
              >
                یا دربارهٔ مطب‌تان بگویید تا دمو را برایتان بیاوریم:
              </div>

              <form
                className="scmd:mt-[1.25em] scmd:flex scmd:flex-col"
                style={{ gap: '0.75em' }}
                onSubmit={submit}
              >
                <div className="scmd:flex scmd:flex-col scmd:md:flex-row" style={{ gap: '0.63em' }}>
                  <input
                    name="name"
                    required
                    placeholder="نام و نام خانوادگی"
                    className="text-field"
                    aria-label="نام و نام خانوادگی"
                  />
                  <input
                    name="clinic"
                    placeholder="نام مطب یا کلینیک"
                    className="text-field"
                    aria-label="نام مطب یا کلینیک"
                  />
                </div>
                <div className="scmd:flex scmd:flex-col scmd:md:flex-row" style={{ gap: '0.63em' }}>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="شمارهٔ تماس"
                    className="text-field"
                    aria-label="شمارهٔ تماس"
                  />
                  <input
                    name="screens"
                    type="number"
                    min={1}
                    max={99}
                    defaultValue={1}
                    placeholder="تعداد مانیتور"
                    className="text-field scmd:md:max-w-[8em]"
                    aria-label="تعداد مانیتور"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="scmd:flex scmd:items-center scmd:justify-center scmd:whitespace-nowrap scmd:transition-opacity disabled:scmd:opacity-60"
                    style={{
                      gap: '0.69em',
                      backgroundColor: 'var(--pink)',
                      color: '#fff',
                      borderRadius: '0.13em',
                      height: '2.9em',
                      padding: '0 1.25em',
                      fontSize: '0.88em',
                    }}
                  >
                    {status === 'loading' ? 'در حال ارسال…' : 'درخواست دمو'}
                    <PlusIcon />
                  </button>
                </div>
              </form>

              <div
                className="scmd:mt-[0.85em] scmd:flex scmd:min-h-[2.2em] scmd:flex-col"
                style={{ gap: '0.3em' }}
              >
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
                <p className="text-9-regular" style={{ opacity: 0.6 }}>
                  {total > 0
                    ? `${toFa(total)} مطب تاکنون دمو را درخواست کرده‌اند.`
                    : 'بدون اسپم — فقط تأیید دمو و به‌روزرسانی‌های محصول.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
