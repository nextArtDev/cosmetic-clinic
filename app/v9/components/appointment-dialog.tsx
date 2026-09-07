'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { treatments, whatsappUrl } from '../lib/content'
import { Modal } from './modal'

export function AppointmentDialog({ interest, onClose }: { interest: string; onClose: () => void }) {
  const titleId = useId()
  const token = useRef<string | null>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const [period, setPeriod] = useState('any')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const [today] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' }))
  const [lastDate] = useState(() => new Date(Date.now() + 179 * 86400000).toISOString().slice(0, 10))
  useEffect(() => {
    if (reference) successRef.current?.focus()
  }, [reference])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    const form = new FormData(event.currentTarget)
    setSending(true)
    setError('')
    if (!token.current) token.current = crypto.randomUUID()
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch('/v9/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email'),
          interest: form.get('interest'),
          preferredDate: form.get('preferredDate'),
          preferredPeriod: period,
          consent: form.get('consent') === 'on',
          requestToken: token.current,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ارسال درخواست شما ممکن نشد.')
      setReference(data.reference)
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name !== 'AbortError'
          ? cause.message
          : 'ارتباط کمی طول کشید. دوباره تلاش کنید؛ درخواست شما تکرار نخواهد شد.',
      )
    } finally {
      window.clearTimeout(timeout)
      setSending(false)
    }
  }

  return (
    <Modal onClose={onClose} titleId={titleId} className="booking-dialog">
      <AnimatePresence mode="wait" initial={false}>
        {reference ? (
          <motion.div
            key="success"
            className="booking-success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            ref={successRef}
            tabIndex={-1}
            role="status"
          >
            <div className="success-emblem">
              <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <motion.path
                  d="m10 20 7 7 14-15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                />
              </svg>
            </div>
            <p className="eyebrow">اولین قدم برای مراقبت از شما</p>
            <h2 id={titleId}>
              مراقبت شما
              <br />
              از اینجا شروع می‌شود.
            </h2>
            <p>
              درخواست شما با دقت ثبت شد. تاریخ انتخابی یک ترجیح است؛ رزرو نهایی هنوز باید با کلینیک
              تأیید شود.
            </p>
            <div className="booking-reference">
              <span>کد پیگیری شما</span>
              <strong>{reference}</strong>
            </div>
            <a
              className="solid-button"
              href={`${whatsappUrl}?text=${encodeURIComponent(
                `سلام! یک درخواست نوبت با کد پیگیری ${reference} ثبت کرده‌ام و می‌خواهم رزروم را تأیید کنم.`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              تأیید در واتس‌اپ <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className="text-button" onClick={onClose}>
              بازگشت به سایت
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="eyebrow">کلینیک دکتر سپیده نادری</p>
            <h2 id={titleId}>از شما مراقبت کنیم؟</h2>
            <p className="booking-intro">
              کمی از آنچه به دنبالش هستید برایمان بنویسید. تیم ما آماده‌ی پذیرش شماست.
            </p>
            <form onSubmit={submit} className="booking-form">
              <label className="field full">
                نام و نام خانوادگی
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="چه‌طور صدامتان کنیم؟"
                  minLength={3}
                  maxLength={120}
                  required
                  autoFocus
                />
              </label>
              <div className="form-row">
                <label className="field">
                  شماره همراه
                  <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="۰۹۱۲ ۰۰۰ ۰۰ ۰۰"
                    pattern="[0-9+()\s.-]{10,22}"
                    maxLength={22}
                    required
                  />
                </label>
                <label className="field">
                  ایمیل
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="shoma@email.com"
                    maxLength={254}
                    required
                  />
                </label>
              </div>
              <label className="field full">
                چه‌طور می‌توانیم کمک کنیم؟
                <select name="interest" defaultValue={interest}>
                  <option value="visit">ویزیت دندانپزشکی</option>
                  {treatments.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-row preferences-row">
                <label className="field">
                  تاریخ دلخواه <span className="optional">(اختیاری)</span>
                  <input
                    name="preferredDate"
                    type="date"
                    min={today}
                    max={lastDate}
                    onChange={(event) => {
                      const day = new Date(`${event.target.value}T12:00:00`).getDay()
                      event.target.setCustomValidity(
                        [4, 5].includes(day)
                          ? 'پذیرش ما از شنبه تا چهارشنبه است.'
                          : '',
                      )
                    }}
                  />
                  <span className="field-note">پذیرش از شنبه تا چهارشنبه.</span>
                </label>
                <fieldset className="period-field">
                  <legend>بهترین بازه زمانی</legend>
                  <div className="period-options">
                    {[
                      { value: 'any', label: 'فرقی ندارد' },
                      { value: 'morning', label: 'صبح' },
                      { value: 'afternoon', label: 'بعدازظهر' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        aria-pressed={period === item.value}
                        className={period === item.value ? 'selected' : ''}
                        onClick={() => setPeriod(item.value)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <label className="consent-field">
                <input name="consent" type="checkbox" required />
                <span>
                  استفاده از اطلاعات خود را برای تماس درباره این درخواست تأیید می‌کنم؛ مطابق{' '}
                  <a href="/v9/privacy" target="_blank" rel="noreferrer">
                    سیاست حریم خصوصی
                  </a>
                  .
                </span>
              </label>
              <AnimatePresence>
                {error && (
                  <motion.p
                    className="form-error"
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <button className="solid-button submit-button" type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <span className="button-spinner" /> در حال ارسال درخواست شما...
                  </>
                ) : (
                  <>
                    درخواست نوبت <span aria-hidden="true">↗</span>
                  </>
                )}
              </button>
              <p className="form-footnote">
                ثبت درخواست به معنای قطعی‌شدن نوبت نیست. ترجیح می‌دهید گفت‌وگو کنید؟{' '}
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  در واتس‌اپ پیام دهید.
                </a>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
