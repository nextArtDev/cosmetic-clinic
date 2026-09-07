'use client'

import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { Check, LoaderCircle, Star } from 'lucide-react'
import { Dialog, FlowLines, Logo, OvalButton, Arrow, ease } from './primitives'
import { navigation, stores, doctors } from '../lib/content'

export type Overlay =
  | 'menu'
  | 'video'
  | 'shop'
  | 'product-original'
  | 'product-mini'
  | 'partner'
  | 'review'
  | 'privacy'
type OverlayProps = {
  kind: Overlay
  onClose: () => void
  onNavigate: (id: string) => void
  onShop: () => void
  onReviewSaved: () => void
}

async function submit(url: string, body: Record<string, string | number | boolean>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean
    error?: string
    reference?: string
  }
  if (!response.ok || !data.success) throw new Error(data.error || 'ثبت درخواست ممکن نشد. دوباره تلاش کنید.')
  return data
}

function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  )
}

function Success({
  title,
  description,
  onClose,
  reference,
}: {
  title: string
  description: string
  onClose: () => void
  reference?: string
}) {
  return (
    <motion.div
      className="form-success"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease, duration: 0.5 }}
      role="status"
    >
      <span className="success-icon">
        <Check size={35} strokeWidth={1.1} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {reference && <span className="submission-reference">{reference}</span>}
      <OvalButton onClick={onClose}>بستن</OvalButton>
    </motion.div>
  )
}

function MenuDialog({ onClose, onNavigate, onShop }: Omit<OverlayProps, 'kind' | 'onReviewSaved'>) {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <Dialog onClose={onClose} title="منوی ناوبری" variant="menu">
      <FlowLines />
      <header className="menu-header shell">
        <a
          href="#top"
          onClick={event => {
            event.preventDefault()
            onNavigate('top')
          }}
          aria-label="کلینیک مهر — خانه"
        >
          <Logo />
        </a>
        <OvalButton onClick={onShop}>دریافت نوبت</OvalButton>
      </header>
      <nav className="menu-nav shell" aria-label="ناوبری اصلی">
        {navigation.map((item, index) => (
          <motion.a
            key={item.id}
            href={`#${item.id}`}
            onClick={event => {
              event.preventDefault()
              onNavigate(item.id)
            }}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(index)}
            onBlur={() => setHover(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.07 + index * 0.06, ease }}
          >
            <span>{item.fa}</span>
            <motion.span
              className="menu-preview"
              animate={{
                width: hover === index ? 115 : 0,
                opacity: hover === index ? 1 : 0,
                marginLeft: hover === index ? 25 : 0,
              }}
              transition={{ duration: 0.45, ease }}
            >
              <img src={`/v8/media/${item.image}`} alt="" />
            </motion.span>
          </motion.a>
        ))}
      </nav>
      <footer className="menu-footer shell">
        <a href="mailto:info@mehr-clinic.ir" className="text-link">
          info@mehr-clinic.ir
          <Arrow direction="diagonal" size={17} />
        </a>
        <div className="menu-socials">
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
            اینستاگرام
          </a>
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer">
            تلگرام
          </a>
        </div>
        <div className="language-switch" aria-label="اطلاعات تماس">
          <span>۰۲۱-۲۲۳۳۴۴۵۵</span>
          <span>تهران، خیابان ولیعصر</span>
        </div>
      </footer>
    </Dialog>
  )
}

function ShopDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="انتخاب روش نوبت‌دهی" onClose={onClose} className="shop-dialog">
      <div className="shop-content">
        <p className="eyebrow">مسیر درمان شما از همین‌جا شروع می‌شود</p>
        <h2>انتخاب روش نوبت</h2>
        <div className="store-links">
          {stores.map((store, i) => (
            <a
              href={store.url}
              target={store.url.startsWith('#') ? undefined : '_blank'}
              rel={store.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              key={store.name}
            >
              <span className="store-index">۰{i + 1}</span>
              <span>{store.name}</span>
              <Arrow direction="diagonal" size={28} />
            </a>
          ))}
        </div>
        <p className="dialog-note">
          ساعت کاری پذیرش: شنبه تا پنجشنبه ۹ تا ۱۹. برای موارد فوری، خط اورژانس کلینیک شبانه
          روزی پاسخگوست.
        </p>
      </div>
      <div className="shop-image">
        <img src="/v8/media/shop.webp" alt="پذیرش کلینیک مهر" />
      </div>
    </Dialog>
  )
}

function ProductDialog({
  mini,
  onClose,
}: {
  mini: boolean
  onClose: () => void
}) {
  const [form, setForm] = useState({ name: '', phone: '', specialty: doctors[0].role })
  const [pending, setPending] = useState(false)
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const data = await submit('/v8/api/appointments', {
        name: form.name,
        phone: form.phone,
        specialty: form.specialty,
        message: mini ? 'درخواست ویزیت آنلاین' : 'درخواست ویزیت حضوری',
      })
      setReference(data.reference || 'ثبت شد')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دوباره تلاش کنید.')
    } finally {
      setPending(false)
    }
  }
  return (
    <Dialog title={mini ? 'ویزیت آنلاین' : 'ویزیت حضوری'} onClose={onClose} className="product-dialog">
      <div className="product-dialog-image">
        <img src={`/v8/media/${mini ? 'mini-card' : 'clingr-card'}.webp`} alt={mini ? 'ویزیت آنلاین' : 'ویزیت حضوری'} />
      </div>
      <div className="product-dialog-copy">
        <p className="eyebrow">درمان دقیق، پیگیری پیوسته</p>
        <h2>
          نوبت
          {mini && <span>آنلاین</span>}
        </h2>
        <p>
          {mini
            ? 'مشاوره تصویری با پزشک تخصص شما برای پیگیری دارو، تفسیر آزمایش یا سؤالات فوری — بدون ترافیک و از خانه.'
            : 'معاینه کامل حضوری با تجهیزات تشخیصی کلینیک؛ پرونده شما از قبل آماده است و جلسه فقط صرف درمان می‌شود.'}
        </p>
        <dl className="specification-list">
          <div>
            <dt>مدت جلسه</dt>
            <dd>{mini ? '۲۰ دقیقه' : '۴۵ دقیقه'}</dd>
          </div>
          <div>
            <dt>تخصص‌ها</dt>
            <dd>قلب، ارتوپدی، مغز و اعصاب، روان‌پزشکی</dd>
          </div>
          <div>
            <dt>نحوه انجام</dt>
            <dd>{mini ? 'تماس تصویری' : 'حضوری در کلینیک'}</dd>
          </div>
          <div>
            <dt>پیگیری</dt>
            <dd>{mini ? 'پیامکی و تلفنی' : 'نوبت حضوری پیگیری'}</dd>
          </div>
        </dl>
        {reference ? (
          <p className="inline-success" role="status">
            <Check size={20} />
            درخواست شما ثبت شد. کد پیگیری: {reference}
          </p>
        ) : (
          <div className="notify-area">
            <form onSubmit={onSubmit} className="enquiry-form">
              <div className="form-two-col">
                <Field
                  label="نام و نام خانوادگی"
                  name="name"
                  required
                  minLength={3}
                  maxLength={100}
                  value={form.name}
                  onChange={event => setForm({ ...form, name: event.target.value })}
                />
                <Field
                  label="شماره تماس"
                  name="phone"
                  type="tel"
                  required
                  minLength={10}
                  maxLength={15}
                  value={form.phone}
                  onChange={event => setForm({ ...form, phone: event.target.value })}
                />
              </div>
              <label className="form-field">
                <span>تخصص مورد نیاز</span>
                <select
                  name="specialty"
                  value={form.specialty}
                  onChange={event => setForm({ ...form, specialty: event.target.value })}
                  style={{
                    width: '100%',
                    border: 0,
                    borderBottom: '1px solid #37384c44',
                    background: 'transparent',
                    padding: '10px 0',
                    font: 'inherit',
                    fontSize: 17,
                    color: 'inherit',
                  }}
                >
                  {doctors.map(doctor => (
                    <option key={doctor.role} value={doctor.role}>
                      {doctor.role} — {doctor.name}
                    </option>
                  ))}
                </select>
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <OvalButton type="submit" className="filled" disabled={pending} arrow={!pending}>
                {pending ? <LoaderCircle className="loading-spinner" size={20} /> : 'ثبت درخواست نوبت'}
              </OvalButton>
            </form>
          </div>
        )}
      </div>
    </Dialog>
  )
}

function PartnerDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [pending, setPending] = useState(false)
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const data = await submit('/v8/api/partners', form)
      setReference(data.reference || 'ثبت شد')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دوباره تلاش کنید.')
    } finally {
      setPending(false)
    }
  }
  return (
    <Dialog title="همکاری با کلینیک مهر" onClose={onClose} className="form-dialog">
      {reference ? (
        <Success
          title="سپاسگزاریم!"
          description="درخواست همکاری شما ثبت شد. کد پیگیری را نگه دارید؛ همکاران ما دو روز کاری آینده با شما تماس می‌گیرند."
          reference={reference}
          onClose={onClose}
        />
      ) : (
        <>
          <p className="eyebrow">همه مسیرهای خوب با یک گفت‌وگو شروع می‌شوند</p>
          <h2>{'بیایید با هم\nکار کنیم'}</h2>
          <p className="form-intro">
            کمی از خودتان و از اینکه چطور می‌خواهید با کلینیک مهر همکاری کنید بنویسید.
          </p>
          <form onSubmit={onSubmit} className="enquiry-form">
            <div className="form-two-col">
              <Field
                label="نام و نام خانوادگی"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={event => setForm({ ...form, name: event.target.value })}
              />
              <Field
                label="ایمیل"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={form.email}
                onChange={event => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <Field
              label="نام مجموعه (اختیاری)"
              name="company"
              autoComplete="organization"
              maxLength={200}
              value={form.company}
              onChange={event => setForm({ ...form, company: event.target.value })}
            />
            <label className="form-field">
              <span>چطور می‌توانیم همکاری کنیم؟</span>
              <textarea
                name="message"
                rows={3}
                required
                minLength={10}
                maxLength={4000}
                value={form.message}
                onChange={event => setForm({ ...form, message: event.target.value })}
              />
            </label>
            <label className="form-consent">
              <input type="checkbox" required />
              <span>
                با ثبت اطلاعات و استفاده از آن‌ها برای پاسخ به این درخواست، موافقت خود را اعلام
                می‌کنم.
              </span>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <OvalButton type="submit" className="filled" disabled={pending} arrow={!pending}>
              {pending ? <LoaderCircle className="loading-spinner" size={20} /> : 'ارسال درخواست'}
            </OvalButton>
          </form>
        </>
      )}
    </Dialog>
  )
}

function ReviewDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' })
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await submit('/v8/api/reviews', form)
      setSuccess(true)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دوباره تلاش کنید.')
    } finally {
      setPending(false)
    }
  }
  return (
    <Dialog title="ثبت تجربه شما" onClose={onClose} className="form-dialog">
      {success ? (
        <Success
          title="ممنون از شما!"
          description="تجربه شما ثبت شد و در بخش نظرات بیماران نمایش داده می‌شود."
          onClose={onClose}
        />
      ) : (
        <>
          <p className="eyebrow">روایت درمان خود را برای دیگران بنویسید</p>
          <h2>{'تجربه شما\nاز مهر'}</h2>
          <form onSubmit={onSubmit} className="enquiry-form">
            <Field
              label="نام شما"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              value={form.name}
              onChange={event => setForm({ ...form, name: event.target.value })}
            />
            <fieldset className="rating-field">
              <legend>امتیاز شما</legend>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map(value => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={value === form.rating}
                      onChange={() => setForm({ ...form, rating: value })}
                    />
                    <Star size={30} strokeWidth={1.1} fill={value <= form.rating ? 'currentColor' : 'none'} />
                    <span className="sr-only">{value} ستاره</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="form-field">
              <span>از تجربه درمان خود بگویید</span>
              <textarea
                required
                minLength={12}
                maxLength={2000}
                rows={4}
                value={form.comment}
                onChange={event => setForm({ ...form, comment: event.target.value })}
              />
            </label>
            <p className="dialog-note">
              نام و نظر شما عمومی نمایش داده می‌شود. لطفاً اطلاعات تماس شخصی درج نکنید.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <OvalButton type="submit" className="filled" disabled={pending} arrow={!pending}>
              {pending ? <LoaderCircle className="loading-spinner" size={20} /> : 'ثبت تجربه'}
            </OvalButton>
          </form>
        </>
      )}
    </Dialog>
  )
}

export function SiteOverlay({ kind, onClose, onNavigate, onShop, onReviewSaved }: OverlayProps) {
  if (kind === 'menu') return <MenuDialog onClose={onClose} onNavigate={onNavigate} onShop={onShop} />
  if (kind === 'video')
    return (
      <Dialog title="معرفی کلینیک مهر" onClose={onClose} variant="video">
        <video
          src="/videos/fv.mp4"
          poster="/v8/media/intro-poster.webp"
          controls
          autoPlay
          playsInline
          preload="auto"
          aria-label="ویدیوی معرفی کلینیک"
        />
        <p className="video-caption">کلینیک مهر. درمان دقیق، پیگیری پیوسته.</p>
      </Dialog>
    )
  if (kind === 'shop') return <ShopDialog onClose={onClose} />
  if (kind === 'product-original' || kind === 'product-mini')
    return <ProductDialog mini={kind === 'product-mini'} onClose={onClose} />
  if (kind === 'partner') return <PartnerDialog onClose={onClose} />
  if (kind === 'review') return <ReviewDialog onClose={onClose} onSaved={onReviewSaved} />
  return (
    <Dialog title="حریم خصوصی و کوکی‌ها" onClose={onClose} className="privacy-dialog">
      <p className="eyebrow">نسخه آزمایشی v8</p>
      <h2>{'حریم خصوصی\nو کوکی‌ها'}</h2>
      <div className="privacy-copy">
        <p>
          این نسخه آزمایشی طراحی است. اطلاعاتی که از طریق فرم‌های نوبت‌دهی، همکاری و ثبت
          تجربه ارسال می‌کنید فقط برای پاسخ به همان درخواست استفاده می‌شود.
        </p>
        <h3>اطلاعات شما</h3>
        <p>
          درخواست‌های نوبت به‌صورت خصوصی ذخیره می‌شوند. نظرات و نامی که ثبت می‌کنید عمومی
          نمایش داده می‌شود. هیچ اطلاعات پرداختی در این مسیر جمع‌آوری نمی‌شود.
        </p>
        <h3>تنظیمات محلی</h3>
        <p>
          وضعیت اطلاعیه کوکی به‌صورت محلی در مرورگر شما ذخیره می‌شود. این نسخه هیچ کوکی
          تبلیغاتی یا آماری نصب نمی‌کند.
        </p>
        <h3>پیگیری درمان</h3>
        <p>
          شماره تماسی که برای هماهنگی نوبت ثبت می‌کنید فقط توسط پرسنل پذیرش برای هماهنگی
          همان نوبت استفاده می‌شود.
        </p>
      </div>
      <OvalButton onClick={onClose}>متوجه شدم</OvalButton>
    </Dialog>
  )
}
