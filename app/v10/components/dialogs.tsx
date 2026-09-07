'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Copy, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from './cart-provider'
import { Action, Eyebrow, Flower } from './ui'
import { cartTotal, clinic, findProduct, formatMoney, toFa, type OrderItem } from '../lib/content'

const ease = [0.22, 1, 0.36, 1] as const
const titles = {
  cart: 'سبد رزرو شما',
  checkout: 'یک قدم تا نوبت شما.',
  contact: 'گفت‌وگو با ما.',
  account: 'پیگیری نوبت.',
  guarantee: 'خیالتان راحت باشد.',
}

function scrollToShop() { window.setTimeout(() => window.dispatchEvent(new CustomEvent('v10:scroll', { detail: '#shop' })), 100) }

export function Dialogs() {
  const { dialog, setDialog } = useCart()
  const panel = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!dialog) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent('v10:lock', { detail: true }))
    const timeout = window.setTimeout(() => panel.current?.querySelector<HTMLButtonElement>('.dialog-close')?.focus(), 100)
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setDialog(null)
      if (event.key !== 'Tab') return
      const focusable = Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select, [tabindex="0"]') ?? []).filter((element) => element.getClientRects().length > 0)
      const first = focusable[0], last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timeout)
      document.body.style.overflow = overflow
      window.dispatchEvent(new CustomEvent('v10:lock', { detail: false }))
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [dialog, setDialog])

  return (
    <AnimatePresence>
      {dialog && (
        <motion.div className="dialog-root" key="dialog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="dialog-backdrop" aria-hidden="true" onClick={() => setDialog(null)} />
          <motion.aside
            ref={panel}
            className="dialog-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="v10-dialog-title"
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="dialog-top">
              <Eyebrow>{clinic.short}</Eyebrow>
              <button className="icon-button dialog-close" aria-label="بستن پنل" onClick={() => setDialog(null)}>
                <X size={23} strokeWidth={1.3} />
              </button>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={dialog} className="dialog-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <h2 id="v10-dialog-title">{titles[dialog]}</h2>
                {dialog === 'cart' && <CartView />}
                {dialog === 'checkout' && <CheckoutView />}
                {dialog === 'contact' && <ContactView />}
                {dialog === 'account' && <AccountView />}
                {dialog === 'guarantee' && <GuaranteeView />}
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CartView() {
  const { items, ready, saving, error, retry, setDialog, changeQuantity, remove } = useCart()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  return (
    <>
      <p className="dialog-intro">سلامت شما، قرارداد ماست.</p>
      {error && <div className="form-error" role="alert">{error}<button onClick={retry} className="text-link">تلاش دوباره</button></div>}
      {!ready ? (
        <div className="empty-bag"><Flower className="loading-flower" /><p>سبد شما آماده می‌شود…</p></div>
      ) : items.length === 0 ? (
        <div className="empty-bag">
          <ShoppingBag size={48} strokeWidth={1} />
          <h3>برای سلامتتان وقت بگذارید.</h3>
          <p>سبد رزرو شما در حال حاضر خالی است.</p>
          <Action onClick={() => { setDialog(null); scrollToShop() }}>دیدن خدمات مطب</Action>
        </div>
      ) : (
        <>
          <p className="mono cart-count">{toFa(count)} مورد در سبد رزرو</p>
          <div className="cart-items">
            {items.map((item) => {
              const product = findProduct(item.productId)!
              return (
                <div className="cart-item" key={`${item.productId}-${item.subscription}`}>
                  <div className="cart-item-image">
                    <Image src={product.image} alt={`${product.name} — ${product.variant}`} fill sizes="120px" />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-title">
                      <h3>{product.name}</h3>
                      <button className="icon-button remove-item" aria-label={`حذف ${product.name}`} onClick={() => remove(item.productId, item.subscription)}>
                        <Trash2 size={16} strokeWidth={1.3} />
                      </button>
                    </div>
                    <p className="muted">{product.variant}</p>
                    <p className="cart-frequency">{item.subscription ? 'اشتراک ماهانه' : 'پرداخت یک‌باره'}</p>
                    <div className="cart-item-bottom">
                      <div className="quantity">
                        <button aria-label={`کاهش تعداد ${product.name}`} onClick={() => changeQuantity(item.productId, item.subscription, -1)}>
                          <Minus size={13} />
                        </button>
                        <span aria-live="polite">{toFa(item.quantity)}</span>
                        <button disabled={item.quantity >= 20} aria-label={`افزایش تعداد ${product.name}`} onClick={() => changeQuantity(item.productId, item.subscription, 1)}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <span>{formatMoney(product.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="cart-summary">
            <div><span>جمع کل</span><span>{formatMoney(cartTotal(items))}</span></div>
            <div className="cart-shipping"><span>پرداخت در مطب یا آنلاین</span><span>به انتخاب شما</span></div>
            <p>تا رسیدن به آرامش. تعهد ما همین است.</p>
            <Action className="full-width" disabled={saving || !!error} onClick={() => setDialog('checkout')}>
              {saving ? 'در حال ذخیرهٔ سبد…' : 'ادامه و ثبت نوبت'}
            </Action>
            <span className="demo-caption">نسخهٔ نمایشی · پرداختی انجام نمی‌شود</span>
          </div>
        </>
      )}
    </>
  )
}

function CheckoutView() {
  const { items, setDialog, clearAfterOrder } = useCart()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const [copied, setCopied] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const response = await fetch('/v10/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setReference(result.reference)
      clearAfterOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد؛ دوباره تلاش کنید.')
    } finally {
      setPending(false)
    }
  }

  if (reference) return (
    <div className="success-state">
      <Flower />
      <Eyebrow>نوبت نمایشی ثبت شد</Eyebrow>
      <h3>همه‌چیز آماده است.</h3>
      <p>درخواست شما در این نسخهٔ نمایشی ذخیره شد. هیچ پرداختی انجام نشده و این نوبت معتبری ایجاد نمی‌کند.</p>
      <div className="order-reference">
        <span className="mono">{reference}</span>
        <button
          className="icon-button"
          aria-label="کپی کد پیگیری"
          onClick={async () => { try { await navigator.clipboard.writeText(reference); setCopied(true) } catch { setCopied(false) } }}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      <p className="muted small">این کد و ایمیل‌تان را نگه دارید تا هر زمان بتوانید درخواست را پیگیری کنید.</p>
      <Action className="full-width" onClick={() => setDialog('account')}>دیدن یک درخواست</Action>
      <button className="text-link" onClick={() => setDialog(null)}>بازگشت به صفحهٔ اصلی</button>
    </div>
  )

  return (
    <>
      <button className="back-link" onClick={() => setDialog('cart')}><ArrowLeft size={15} /> بازگشت به سبد</button>
      <div className="demo-notice">
        <span className="mono">یادداشت کوچک</span>
        <p>این یک ثبت‌نوبت نمایشی است. درخواست شما ذخیره می‌شود اما پرداختی انجام نمی‌شود و وقت واقعی رزرو نمی‌گردد.</p>
      </div>
      <form onSubmit={submit} className="site-form">
        <label>ایمیل<input autoComplete="email" name="email" type="email" placeholder="you@example.com" required maxLength={254} dir="ltr" /></label>
        <label>نام و نام خانوادگی<input autoComplete="name" name="name" placeholder="نام شما" required minLength={3} maxLength={100} /></label>
        <label>شماره تماس<input autoComplete="tel" name="phone" type="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" required minLength={10} maxLength={15} dir="ltr" /></label>
        <div className="form-row">
          <label>شهر<input autoComplete="address-level2" name="city" placeholder="شهر" required minLength={2} maxLength={100} /></label>
          <label>کد پستی<input autoComplete="postal-code" name="postalCode" placeholder="کد پستی" required minLength={3} maxLength={20} dir="ltr" /></label>
        </div>
        <div className="checkout-total">
          <span>جمع کل · پرداخت در مطب</span>
          <strong>{formatMoney(cartTotal(items))}</strong>
        </div>
        {items.some((item) => item.subscription) && <p className="small muted">انتخاب شما شامل اشتراک ماهانه است. این نسخهٔ نمایشی پرداخت دوره‌ای راه نمی‌اندازد.</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <Action type="submit" className="full-width" disabled={pending || items.length === 0}>
          {pending ? 'در حال ثبت درخواست…' : 'ثبت درخواست نمایشی'}
        </Action>
      </form>
    </>
  )
}

function ContactView() {
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      const response = await fetch('/v10/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.get('name'), email: data.get('email'), message: data.get('message'), subscribe: data.get('subscribe') === 'on' })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دوباره تلاش کنید.')
    } finally {
      setPending(false)
    }
  }
  if (success) return (
    <div className="success-state">
      <Flower />
      <h3>گفت‌وگوی خوب از این‌جا شروع می‌شود.</h3>
      <p>پیام شما دریافت و ذخیره شد. از اینکه با ما در ارتباط هستید سپاسگزاریم.</p>
      <Action onClick={() => setSuccess(false)}>فرستادن پیام تازه</Action>
    </div>
  )
  return (
    <>
      <p className="dialog-intro">دربارهٔ مسیر درمان سؤالی دارید؟ می‌خواهید تجربه‌تان را با ما به اشتراک بگذارید؟ گوش می‌دهیم.</p>
      <form onSubmit={submit} className="site-form">
        <label>نام شما<input name="name" autoComplete="name" required minLength={3} maxLength={100} placeholder="نام و نام خانوادگی" /></label>
        <label>ایمیل<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" dir="ltr" /></label>
        <label>پیام شما<textarea name="message" rows={5} required minLength={10} maxLength={4000} placeholder="کمی بیشتر برایمان بنویسید…" /></label>
        <label className="checkbox-label">
          <input name="subscribe" type="checkbox" />
          <span>مرا از مطالب آموزشی سلامت زنان باخبر کنید.</span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Action type="submit" className="full-width" disabled={pending}>{pending ? 'در حال فرستادن…' : 'فرستادن پیام'}</Action>
        <p className="small muted">{clinic.address}</p>
      </form>
    </>
  )
}

function AccountView() {
  const [pending, setPending] = useState(false), [error, setError] = useState('')
  const [order, setOrder] = useState<{ reference: string; items: OrderItem[]; total: number; status: string; createdAt: string } | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const response = await fetch('/v10/api/orders/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setOrder(result.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دوباره تلاش کنید.')
    } finally {
      setPending(false)
    }
  }

  if (order) return (
    <div className="order-detail">
      <Eyebrow>درخواست نمایشی · ذخیره‌شده</Eyebrow>
      <h3>{order.reference}</h3>
      <p className="muted">{new Date(order.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      {order.items.map((item) => (
        <div className="order-detail-line" key={`${item.productId}-${item.subscription}`}>
          <div>
            <strong>{item.name}</strong>
            <p>{item.variant} · تعداد {toFa(item.quantity)}</p>
            <small>{item.subscription ? 'اشتراک ماهانه' : 'پرداخت یک‌باره'}</small>
          </div>
          <span>{formatMoney(item.price * item.quantity)}</span>
        </div>
      ))}
      <div className="checkout-total"><span>جمع کل</span><strong>{formatMoney(order.total)}</strong></div>
      <p className="demo-notice">این یک درخواست نمایشی ذخیره‌شده است. هیچ پرداخت یا نوبت واقعی آغاز نشده است.</p>
      <Action className="full-width" onClick={() => setOrder(null)}>پیگیری درخواست دیگر</Action>
    </div>
  )

  return (
    <>
      <p className="dialog-intro">مسیر سلامت شما، همه در یک جا. درخواست ذخیره‌شده را با ایمیل و کد پیگیری ببینید.</p>
      <form className="site-form" onSubmit={submit}>
        <label>ایمیل<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" dir="ltr" /></label>
        <label>کد پیگیری<input name="reference" required maxLength={20} placeholder="MS-XXXXXXXXXX" dir="ltr" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Action type="submit" className="full-width" disabled={pending}>{pending ? 'در حال جست‌وجو…' : 'پیدا کردن درخواست'}</Action>
        <p className="small muted">کد پیگیری پس از ثبت درخواست نمایشی نشان داده می‌شود. رمز عبوری لازم نیست.</p>
      </form>
    </>
  )
}

function GuaranteeView() {
  const { setDialog } = useCart()
  return (
    <>
      <div className="guarantee-flower"><Flower /></div>
      <Eyebrow>تعهد ما به شما</Eyebrow>
      <p className="dialog-intro">اگر راضی نباشید، ما هم راضی نیستیم. طرح اصلی با ضمانت بازگشت ۶۰ روزه پشتیبان مشتری خودش بود؛ تعهد ما هم‌اندازهٔ آن است.</p>
      <div className="guarantee-points">
        <p><Check size={18} /> زمان کافی برای انتخاب مسیر درمان درست</p>
        <p><Check size={18} /> مشاورهٔ اول بدون هزینهٔ پنهان</p>
        <p><Check size={18} /> بدون تعهد؛ هر زمان می‌توانید انصراف دهید</p>
      </div>
      <p className="small muted">این بازآفرین یک نسخهٔ نمایشی است. هیچ خرید، پرداخت، نوبت یا بازپرداخت واقعی این‌جا انجام نمی‌شود.</p>
      <Action className="full-width" onClick={() => { setDialog(null); scrollToShop() }}>دیدن خدمات مطب</Action>
      <button className="text-link" onClick={() => setDialog('contact')}>هنوز سؤالی دارید؟ گفت‌وگو کنیم.</button>
    </>
  )
}
