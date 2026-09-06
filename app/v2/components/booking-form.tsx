'use client'

import { useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpLeft, Check, LoaderCircle } from 'lucide-react'
import { consultationTypes } from '../lib/site-content'

export function BookingForm({
  selectedType,
  onTypeChange,
  onPrivacy,
}: {
  selectedType: string
  onTypeChange: (value: string) => void
  onPrivacy: () => void
}) {
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [reference, setReference] = useState('')
  const [firstName, setFirstName] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    const data = new FormData(form)
    const newErrors: Record<string, string> = {}
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    if (name.length < 2) newErrors.name = 'لطفاً نام خود را وارد کنید.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'لطفاً یک آدرس ایمیل معتبر وارد کنید.'
    if (!data.get('consent'))
      newErrors.consent = 'لطفاً با توضیحات حریم خصوصی موافقت کنید.'
    setErrors(newErrors)
    if (Object.keys(newErrors).length) {
      setStatus('error')
      setMessage('لطفاً فیلدهای مشخص‌شده را بررسی کنید.')
      form
        .querySelector<HTMLElement>(`[name="${Object.keys(newErrors)[0]}"]`)
        ?.focus()
      return
    }
    setStatus('sending')
    setMessage('')
    try {
      const response = await fetch('/v2/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(data.entries()),
          consultationType: selectedType,
          consent: data.get('consent') === 'on',
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        setErrors(result.errors || {})
        throw new Error(result.error || 'لطفاً کمی بعد دوباره تلاش کنید.')
      }
      setReference(result.reference)
      setFirstName(name.split(' ')[0])
      setStatus('success')
      window.setTimeout(() => resultRef.current?.focus(), 100)
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error
          ? error.message
          : 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
      )
    }
  }

  const errorFor = (field: string) =>
    errors[field] ? (
      <span className="field-error" id={`${field}-error`}>
        {errors[field]}
      </span>
    ) : null

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === 'success' ? (
        <motion.div
          ref={resultRef}
          tabIndex={-1}
          key="success"
          className="booking-success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
        >
          <span className="success-mark">
            <Check size={32} strokeWidth={1.3} />
          </span>
          <span className="eyebrow">فصل جدید شما از اینجا آغاز می‌شود</span>
          <h3>
            سپاس،
            <br />
            {firstName}.
          </h3>
          <p>
            درخواست مشاوره شما ثبت شد. جلسه انتخابی شما{' '}
            <strong>
              {consultationTypes.find((type) => type.id === selectedType)?.title}
            </strong>{' '}
            است.
          </p>
          <div className="request-reference">
            <span>کد پیگیری درخواست</span>
            <strong>{reference}</strong>
          </div>
          <p className="success-note">
            این وب‌سایت نسخه‌ای نمایشی است. هیچ نوبتی ثبت نشده، ایمیلی ارسال
            نشده و پرداختی انجام نگرفته است.
          </p>
          <button
            className="text-link"
            type="button"
            onClick={() => {
              setStatus('idle')
              setErrors({})
              setMessage('')
            }}
          >
            بازگشت به فرم <ArrowUpLeft size={18} />
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          ref={formRef}
          onSubmit={submit}
          className="booking-form"
          noValidate
          exit={{ opacity: 0, y: -15 }}
          aria-label="رزرو مشاوره"
        >
          <div className="form-heading">
            <span className="eyebrow">کمی درباره خودتان</span>
            <span>( 01 — 03 )</span>
          </div>
          <div className="form-grid">
            <label className={`form-field ${errors.name ? 'invalid' : ''}`}>
              <span>
                نام شما <i>*</i>
              </span>
              <input
                name="name"
                autoComplete="name"
                placeholder="چطور صداتان کنم؟…"
                maxLength={120}
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errorFor('name')}
            </label>
            <label className={`form-field ${errors.email ? 'invalid' : ''}`}>
              <span>
                آدرس ایمیل <i>*</i>
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="you@example.com…"
                maxLength={254}
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errorFor('email')}
            </label>
            <label className={`form-field ${errors.phone ? 'invalid' : ''}`}>
              <span>
                شماره تماس <small>(اختیاری)</small>
              </span>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+98 912 000 0000…"
                maxLength={40}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errorFor('phone')}
            </label>
            <label className="form-field">
              <span>کجا زندگی می‌کنید؟</span>
              <input
                name="country"
                autoComplete="country-name"
                placeholder="کشور / منطقه زمانی…"
                maxLength={120}
              />
              {errorFor('country')}
            </label>
          </div>
          <label className="form-field select-field">
            <span>
              نوع مشاوره <i>*</i>
            </span>
            <select
              name="consultationType"
              value={selectedType}
              onChange={(event) => onTypeChange(event.target.value)}
            >
              {consultationTypes.map((type) => (
                <option value={type.id} key={type.id}>
                  {type.title}
                </option>
              ))}
            </select>
            {errorFor('consultationType')}
          </label>
          <label className="form-field message-field">
            <span>
              چه چیزی شما را آورده؟ <small>(اختیاری)</small>
            </span>
            <textarea
              name="message"
              placeholder="کمی از اهداف پوستی‌تان بگویید…"
              rows={2}
              maxLength={3000}
              aria-describedby="message-help"
            />
            {errorFor('message')}
          </label>
          <span id="message-help" className="form-hint">
            لطفاً در این درخواست اولیه، اطلاعات حساس پزشکی وارد نکنید.
          </span>
          <div className="form-honeypot" aria-hidden="true">
            <label>
              وب‌سایت
              <input name="website" autoComplete="off" tabIndex={-1} />
            </label>
          </div>
          <div className="consent-wrap">
            <label className="consent">
              <input
                name="consent"
                type="checkbox"
                required
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? 'consent-error' : undefined}
              />
              <span>
                با پردازش اطلاعات‌ام مطابق{' '}
                <button type="button" onClick={onPrivacy}>
                  توضیحات حریم خصوصی
                </button>{' '}
                موافقم.
              </span>
            </label>
            {errorFor('consent')}
          </div>
          {message && (
            <p className="form-alert" role="alert">
              {message}
            </p>
          )}
          <motion.button
            className="submit-button"
            type="submit"
            disabled={status === 'sending'}
            whileHover={{ backgroundColor: '#ffd387' }}
            whileTap={{ scale: 0.985 }}
          >
            <span>
              {status === 'sending' ? 'در حال ارسال درخواست' : 'رزرو مشاوره'}
            </span>
            {status === 'sending' ? (
              <LoaderCircle className="animate-spin" size={25} />
            ) : (
              <ArrowUpLeft size={28} strokeWidth={1.4} />
            )}
          </motion.button>
          <p className="form-footnote">
            رویکردی شخصی. برنامه‌ای سنجیده. برای پرسیدن نیازی به پرداخت نیست.
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
