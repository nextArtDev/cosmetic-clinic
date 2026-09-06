'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowIcon, ArrowLink, ease } from './motion-primitives'
import { contactServices } from '../lib/content'

export function ContactForm() {
  const [service, setService] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<{ id: string; name: string } | null>(null)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const initial = new URLSearchParams(window.location.search).get('khadamat')
      if (initial && contactServices.includes(initial)) setService(initial)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError(''); setFields({})
    if (!service) { setFields({ service: 'یکی از خدمات را برای پیگیری درخواست انتخاب کنید.' }); return }
    const form = new FormData(event.currentTarget)
    const payload = { name: form.get('name'), phone: form.get('phone'), email: form.get('email'), service, callTime: form.get('callTime'), message: form.get('message'), consent: form.get('consent') === 'on', nickname: form.get('nickname') }
    setPending(true)
    try {
      const response = await fetch('/v3/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'لطفاً دوباره تلاش کنید.'); setFields(data.fields || {}); return }
      setSuccess({ id: data.id, name: String(form.get('name')).split(' ')[0] })
    } catch { setError('ارتباط برقرار نشد. اطلاعات شما سر جای خودش است؛ می‌توانید دوباره تلاش کنید.') }
    finally { setPending(false) }
  }

  if (success) return (
    <motion.div className="contact-success" role="status" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
      <div className="success-mark"><ArrowIcon diagonal /></div><p className="eyebrow">قدم اول انجام شد</p><h2>ممنون، <em>{success.name}.</em></h2><p>درخواست شما با موفقیت ثبت شد.<br />به‌زودی برای هماهنگی مشاوره با شما تماس می‌گیریم.</p><span className="success-reference">کد پیگیری شما: {success.id.slice(0, 8).toUpperCase()}</span><ArrowLink href="/v3/nemune-karha">تا آن موقع، نمونه‌کارها را ببینید</ArrowLink><button className="text-link" onClick={() => { setSuccess(null); setService('') }}>ثبت درخواست جدید</button>
    </motion.div>
  )

  return (
    <form className="contact-form" onSubmit={submit} id="contact-form">
      <div className="form-intro"><p className="eyebrow">۰۱ — شما و خواسته‌تان</p><p>با هم آشنا شویم.</p></div>
      <div className="form-grid">
        <label className="form-field"><span>نام و نام خانوادگی <b>*</b></span><input name="name" autoComplete="name" placeholder="مثلاً سارا محمدی" required minLength={2} maxLength={120} aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? 'v3-error-name' : undefined} />{fields.name && <small id="v3-error-name">{fields.name}</small>}</label>
        <label className="form-field"><span>شماره موبایل <b>*</b></span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" required aria-invalid={Boolean(fields.phone)} aria-describedby={fields.phone ? 'v3-error-phone' : undefined} />{fields.phone && <small id="v3-error-phone">{fields.phone}</small>}</label>
        <label className="form-field"><span>ایمیل <span className="optional">(اختیاری)</span></span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={255} aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? 'v3-error-email' : undefined} />{fields.email && <small id="v3-error-email">{fields.email}</small>}</label>
      </div>
      <fieldset className="service-options"><legend><span className="eyebrow">۰۲ — درخواست شما</span>چه خدمتی نیاز دارید؟ <b>*</b></legend><div>{contactServices.map(item => <button type="button" key={item} onClick={() => { setService(item); setFields(old => ({ ...old, service: '' })) }} className={service === item ? 'is-selected' : ''} aria-pressed={service === item}>{item}<span aria-hidden="true">{service === item ? '✓' : '+'}</span></button>)}</div>{fields.service && <small className="field-error" role="alert">{fields.service}</small>}</fieldset>
      <label className="form-field budget-field"><span>زمان مناسب برای تماس <b>*</b></span><select name="callTime" required defaultValue="" aria-invalid={Boolean(fields.callTime)} aria-describedby={fields.callTime ? 'v3-error-callTime' : undefined}><option value="" disabled>انتخاب کنید</option><option>هر زمان</option><option>صبح</option><option>بعدازظهر</option><option>عصر</option></select>{fields.callTime && <small id="v3-error-callTime">{fields.callTime}</small>}</label>
      <label className="form-field message-field"><span>شرح حال و خواسته‌ی شما <b>*</b></span><textarea name="message" placeholder="مثلاً چند سال است این مشکل را دارید، آیا جراحی قبلی داشته‌اید، چه نتیجه‌ای انتظار دارید…" rows={4} required minLength={20} maxLength={5000} aria-invalid={Boolean(fields.message)} aria-describedby={fields.message ? 'v3-error-message' : undefined} />{fields.message && <small id="v3-error-message">{fields.message}</small>}</label>
      <div className="form-honeypot" aria-hidden="true"><label>پر نکنید<input name="nickname" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="form-consent"><input name="consent" type="checkbox" required /><span>می‌پذیرم که اطلاعات من فقط برای پاسخ به همین درخواست استفاده شود، مطابق <Link href="/v3/mahramiat">سیاست حریم خصوصی</Link>. <b>*</b></span></label>
      {fields.consent && <small className="field-error">{fields.consent}</small>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-submit-row"><button type="submit" disabled={pending} className="submit-button">{pending ? <><span className="button-spinner" />در حال ثبت…</> : <>نوبت من را ثبت کنید<ArrowIcon /></>}</button><span>فیلدهای ستاره‌دار لازم هستند.</span></div>
    </form>
  )
}
