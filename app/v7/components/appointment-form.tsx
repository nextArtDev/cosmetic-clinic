'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'
import { services, type ConsultationLocation, type ServiceId } from '../lib/site-content'

export default function AppointmentForm({
  service,
  initialLocation = 'تهران',
  onClose,
}: {
  service?: ServiceId
  initialLocation?: ConsultationLocation
  onClose: () => void
}) {
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [reference, setReference] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState(initialLocation)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending') return
    const form = new FormData(event.currentTarget)
    const values = Object.fromEntries(form.entries())
    setStatus('sending')
    setError('')
    setFields({})
    try {
      const response = await fetch('/v7/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, consent: form.get('consent') === 'on' }),
      })
      const result = await response.json()
      if (!response.ok) {
        setFields(result.errors || result.fields || {})
        throw new Error(result.error || 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.')
      }
      setReference(result.reference)
      setSubmittedName(String(values.name).trim().split(' ')[0])
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'اتصال برقرار نشد. لطفاً دوباره تلاش کنید.')
      setStatus('error')
    }
  }

  const fieldError = (name: string) =>
    fields[name] ? (
      <span className="field-error" id={`${name}-error`}>
        {fields[name]}
      </span>
    ) : null

  return (
    <div className="appointment-layout">
      <div className="appointment-visual">
        <Image
          src="/v7/images/appointment.webp"
          alt="مطالعه‌ای هنری از تناسب‌های طبیعی"
          fill
          sizes="(max-width: 760px) 100vw, 400px"
        />
        <div className="appointment-visual-caption">
          <span className="eyebrow">یک رویکرد شخصی</span>
          <p>
            زیباییِ شما.
            <br />
            داستانِ شما.
          </p>
        </div>
      </div>
      <div className="appointment-content">
        {status === 'success' ? (
          <div className="appointment-success" role="status" aria-live="polite">
            <span className="success-symbol">
              <Check size={36} strokeWidth={1} />
            </span>
            <span className="eyebrow">قدم اول، برداشته شد</span>
            <h2>
              ممنون،
              <br />
              {submittedName}.
            </h2>
            <p>درخواست مشاوره شما با موفقیت ثبت شد.</p>
            <div className="confirmation-details">
              <span>کد پیگیری</span>
              <strong>{reference}</strong>
              <span>محل مشاوره</span>
              <strong>{location}</strong>
              {date && (
                <>
                  <span>تاریخ پیشنهادی</span>
                  <strong>
                    {new Date(`${date}T12:00:00`).toLocaleDateString('fa-IR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                </>
              )}
            </div>
            <p className="small-note">
              این نمونه درخواست شما را به‌صورت محلی نگه می‌دارد. با کلینیک تماس گرفته نمی‌شود و
              نوبتی قطع نمی‌شود.
            </p>
            <button className="solid-button" onClick={onClose}>
              ادامه دیدن سایت <ArrowUpRight size={19} />
            </button>
          </div>
        ) : (
          <>
            <span className="eyebrow">گفت‌وگو را آغاز کنیم</span>
            <h2>
              فصلِ
              <br />
              تازه.
            </h2>
            <p className="form-intro">
              یک گفت‌وگوی سنجیده، قدم اول است. کمی از خودتان برایمان بگویید.
            </p>
            <form onSubmit={submit} className="appointment-form">
              <div className="form-row">
                <label>
                  نام و نام خانوادگی <span>*</span>
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="نام شما"
                    required
                    minLength={2}
                    maxLength={120}
                    aria-invalid={!!fields.name}
                    aria-describedby={fields.name ? 'name-error' : undefined}
                  />
                  {fieldError('name')}
                </label>
                <label>
                  ایمیل <span>*</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                    aria-invalid={!!fields.email}
                    aria-describedby={fields.email ? 'email-error' : undefined}
                  />
                  {fieldError('email')}
                </label>
              </div>
              <div className="form-row">
                <label>
                  شماره تماس <span>*</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
                    required
                    minLength={7}
                    maxLength={40}
                    aria-invalid={!!fields.phone}
                    aria-describedby={fields.phone ? 'phone-error' : undefined}
                  />
                  {fieldError('phone')}
                </label>
                <label>
                  خدمت موردنظر
                  <select name="procedure" defaultValue={service || 'not-sure'}>
                    <option value="not-sure">می‌خواهیم گزینه‌ها را بررسی کنیم</option>
                    {services.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  {fieldError('procedure')}
                </label>
              </div>
              <div className="form-row">
                <label>
                  محل مشاوره
                  <select
                    name="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value as ConsultationLocation)}
                  >
                    <option>تهران</option>
                    <option>کرج</option>
                    <option>آنلاین</option>
                  </select>
                  {fieldError('location')}
                </label>
                <label>
                  تاریخ پیشنهادی <span className="optional">اختیاری</span>
                  <input
                    type="date"
                    name="preferredDate"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    aria-invalid={!!fields.preferredDate}
                    aria-describedby={fields.preferredDate ? 'preferredDate-error' : undefined}
                  />
                  {fieldError('preferredDate')}
                </label>
              </div>
              <label>
                چند کلام <span className="optional">اختیاری</span>
                <textarea
                  name="message"
                  placeholder="دوست دارید درباره چه چیزی صحبت کنیم؟ لطفاً مدارک پزشکی نفرستید."
                  rows={2}
                  maxLength={2000}
                />
                {fieldError('message')}
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  این فیلد را خالی بگذارید
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <label className="consent-label">
                <input name="consent" type="checkbox" required />
                <span>
                  با نحوه پردازش درخواستم مطابق{' '}
                  <button
                    type="button"
                    className="inline-link"
                    aria-expanded={showPrivacy}
                    onClick={() => setShowPrivacy((value) => !value)}
                  >
                    توضیحات حریم خصوصی
                  </button>{' '}
                  موافقم.
                </span>
              </label>
              {showPrivacy && (
                <div className="inline-privacy">
                  <strong>حریم خصوصی شما</strong>
                  <p>
                    این نمونه اطلاعات ارسالی شما را فقط در حافظه موقت همان سرور نگه می‌دارد تا
                    روند مشاوره نمایش داده شود. اطلاعاتتان برای کلینیک ارسال نمی‌شود و نوبتی قطع
                    نمی‌شود. لطفاً مدارک پزشکی درج نکنید. از کوکی تبلیغاتی یا آمار شخص ثالث
                    استفاده نمی‌شود.
                  </p>
                </div>
              )}
              {fieldError('consent')}
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="solid-button" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? (
                  <>
                    در حال ثبت درخواست <LoaderCircle className="animate-spin" size={18} />
                  </>
                ) : (
                  <>
                    درخواست مشاوره <ArrowUpRight size={20} strokeWidth={1.3} />
                  </>
                )}
              </button>
              <p className="small-note">
                نمونه بازآفرینی · درخواست‌ها اینجا ذخیره می‌شوند، نه برای کلینیک. تاریخ پیشنهادی به
                معنای نوبت قطعی نیست.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
