'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ArrowLeft, ArrowRight, Check, MapPin } from 'lucide-react'
import {
  services,
  results,
  priceItems,
  type OverlayState,
  type ServiceId,
} from '../lib/site-content'
import { Dialog, Logo } from './ui'
import AppointmentForm from './appointment-form'

type Props = {
  overlay: OverlayState
  onClose: () => void
  onOpen: (overlay: OverlayState) => void
  onNavigate: (id: string) => void
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export function toFa(value: number) {
  return value
    .toLocaleString('en-US')
    .replaceAll(',', '٬')
    .replace(/\d/g, (d) => FA_DIGITS[Number(d)])
}

function PriceCalculator({ onOpen }: { onOpen: Props['onOpen'] }) {
  const [location, setLocation] = useState('تهران')
  const [selected, setSelected] = useState<string[]>(['full-body'])
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  const total = priceItems.reduce(
    (sum, item) => (selected.includes(item.id) ? sum + item.price : sum),
    0,
  )
  const currency = (value: number) => `${toFa(value)} تومان`
  const first = priceItems.find((item) => selected.includes(item.id))
  return (
    <div className="price-content">
      <span className="eyebrow">شفافیت در هر قدم</span>
      <h2>
        راهنمای قیمت
        <br />
        شخصیِ شما.
      </h2>
      <p>
        تعرفه‌های راهنما را ببینید. برنامه درمان و مبلغ نهایی همیشه به‌صورت شخصی اعلام می‌شود.
      </p>
      <div className="location-switch" aria-label="محل درمان">
        {['تهران', 'کرج / آنلاین'].map((item) => (
          <button
            key={item}
            aria-pressed={location === item}
            className={location === item ? 'active' : ''}
            onClick={() => setLocation(item)}
          >
            <MapPin size={14} />
            {item}
          </button>
        ))}
      </div>
      <div className="price-items">
        {priceItems.map((item) => (
          <label
            className={`price-item ${selected.includes(item.id) ? 'selected' : ''}`}
            key={item.id}
          >
            <span className="price-item-name">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggle(item.id)}
              />
              <span>{item.label}</span>
            </span>
            <span className="price-value">
              {location === 'تهران' ? currency(item.price) : 'بعد از مشاوره'}
            </span>
          </label>
        ))}
      </div>
      <div className="price-summary">
        <div>
          <span className="eyebrow">
            {location === 'تهران' ? 'جمع تقریبی شروع' : 'برنامه درمان شما'}
          </span>
          <strong aria-live="polite">
            {location === 'تهران' ? currency(total) : 'دقیقاً شخصی‌سازی‌شده'}
          </strong>
        </div>
        <button
          className="inline-link"
          onClick={() => setSelected([])}
          disabled={!selected.length}
        >
          پاک کردن انتخاب‌ها
        </button>
      </div>
      <p className="small-note">
        {location === 'تهران'
          ? 'تعرفه‌های راهنما مربوط به کلینیک تهران است. آزمایش‌های پیش از درمان، اقامت اضافه، دارو‌ها و وسایل مراقبت شامل این مبالغ نیست. خدمات ترکیبی به بررسی جداگانه نیاز دارد. این تخمین، فاکتور یا توصیه پزشکی نیست.'
          : 'هزینه خدمات در کرج و مشاوره‌های آنلاین به‌صورت شخصی محاسبه می‌شود. ناحیه‌های مورد نظر خود را انتخاب کنید و برای بررسی برنامه، درخواست مشاوره بدهید.'}
      </p>
      <button
        className="solid-button"
        onClick={() => onOpen({ type: 'appointment', service: first?.service as ServiceId | undefined })}
      >
        درباره برنامه شخصی صحبت کنیم <ArrowUpRight size={20} />
      </button>
    </div>
  )
}

function Menu({ onOpen, onNavigate }: { onOpen: Props['onOpen']; onNavigate: Props['onNavigate'] }) {
  const links = [
    { label: 'پزشک', id: 'doctor' },
    { label: 'تخصص ما', id: 'services' },
    { label: 'گالری نتیجه‌ها', id: 'results' },
    { label: 'رویکرد', id: 'approach' },
    { label: 'راهنمای قیمت', id: 'prices' },
    { label: 'پرسش‌های شما', id: 'faq' },
    { label: 'تماس', id: 'contacts' },
  ]
  return (
    <div className="menu-content">
      <a
        href="#"
        className="menu-wordmark"
        onClick={(event) => {
          event.preventDefault()
          onNavigate('home')
        }}
        aria-label="بازگشت به خانه"
      >
        <Logo />
      </a>
      <div className="menu-grid">
        <div>
          <span className="eyebrow">رویکردی سنجیده را کشف کنید</span>
          <nav className="menu-links" aria-label="ناوبری اصلی">
            {links.map((link, index) => (
              <motion.a
                href={`#${link.id}`}
                key={link.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.045 + 0.1, duration: 0.45 }}
                onClick={(event) => {
                  event.preventDefault()
                  if (link.id === 'prices') onOpen({ type: 'calculator' })
                  else onNavigate(link.id)
                }}
              >
                <span className="menu-index">{['۰۱', '۰۲', '۰۳', '۰۴', '۰۵', '۰۶', '۰۷'][index]}</span>
                <span>{link.label}</span>
                <ArrowUpRight strokeWidth={1} />
              </motion.a>
            ))}
          </nav>
        </div>
        <div className="menu-feature">
          <Image
            src="/v7/images/menu-feature.webp"
            alt="زیبایی در شخصی‌ترین شکلش"
            fill
            sizes="45vw"
          />
          <div>
            <span className="eyebrow">زیبایی شما. ظرافت ما.</span>
            <button onClick={() => onOpen({ type: 'appointment' })}>
              سفرتان را آغاز کنید <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="menu-bottom">
        <span>لیزر به مثابه هنر</span>
        <span>تهران · کرج</span>
        <a href="mailto:info@dr-grigori-laser.ir">
          info@dr-grigori-laser.ir <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  )
}

function DoctorProfile({ onOpen }: { onOpen: Props['onOpen'] }) {
  return (
    <div className="detail-layout profile-layout">
      <div className="detail-visual">
        <Image
          src="/v7/images/portrait.webp"
          alt="دکتر آرمان گریگوری"
          fill
          sizes="(max-width: 760px) 100vw, 45vw"
        />
      </div>
      <div className="detail-content">
        <span className="eyebrow">متخصصی پشتِ این ظرافت</span>
        <h2>
          آرمان
          <br />
          گریگوری.
        </h2>
        <p className="detail-lead">
          دقتِ یک متخصص.
          <br />
          نگاهِ یک هنرمند.
        </p>
        <p>
          متخصص پوست، مو و لیزر و سرپرست فنی بخش لیزر یک مرکز درمانی بین‌المللی؛ با مطب‌هایی در
          تهران و کرج.
        </p>
        <p>
          دکتر گریگوری تجربه‌ای گسترده و نگاهی زیبایی‌شناسانه به مسیر هر مراجع می‌آورد. فلسفه او
          ساده است: شکوفا کردن زیبایی‌ای که از قبل هست، نه تحمیل یک الگوی آماده.
        </p>
        <div className="profile-facts">
          <span>
            <strong>۱۲+</strong> سال تجربه تخصصی
          </span>
          <span>
            <strong>۹٬۵۰۰+</strong> مراجعه‌کننده
          </span>
          <span>
            <strong>۲۵٬۰۰۰+</strong> جلسه لیزر
          </span>
        </div>
        <p className="small-note">آمار تجربه بر اساس پرونده کلینیک، به‌عنوان داده نمونه.</p>
        <button className="outline-button" onClick={() => onOpen({ type: 'appointment' })}>
          یک مشاوره شخصی <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  )
}

function Procedure({ id, onOpen }: { id: ServiceId; onOpen: Props['onOpen'] }) {
  const service = services.find((item) => item.id === id)!
  return (
    <div className="detail-layout">
      <div className="detail-visual">
        <Image
          src={service.image}
          alt={service.subtitle}
          fill
          sizes="(max-width: 760px) 100vw, 45vw"
        />
        <span className="detail-image-index">{service.number} / ۰۵</span>
      </div>
      <div className="detail-content">
        <span className="eyebrow">{service.subtitle}</span>
        <h2>{service.title}</h2>
        <p className="detail-lead">{service.description}</p>
        <p>{service.detail}</p>
        <span className="eyebrow detail-label">محدوده‌ای شخصی از امکان‌ها</span>
        <ul className="procedure-options">
          {service.procedures.map((item) => (
            <li key={item}>
              <Check size={15} strokeWidth={1.2} />
              {item}
            </li>
          ))}
        </ul>
        <span className="eyebrow detail-label">بهبود و مراقبت</span>
        <p>{service.recovery}</p>
        <p className="small-note">
          هر درمان لیزری ریسک‌هایی دارد. مناسب بودن، جایگزین‌ها و نتیجه مورد انتظار در جلسه مشاوره
          بررسی می‌شود.
        </p>
        <button
          className="outline-button"
          onClick={() => onOpen({ type: 'appointment', service: service.id })}
        >
          درباره امکان‌هایتان صحبت کنیم <ArrowUpRight size={20} />
        </button>
        <button
          className="text-button detail-price-link"
          onClick={() => onOpen({ type: 'calculator' })}
        >
          راهنمای قیمت را ببینید <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  )
}

function Gallery({ id, onOpen }: { id: string; onOpen: Props['onOpen'] }) {
  const index = Math.max(0, results.findIndex((item) => item.id === id))
  const result = results[index]
  const change = (direction: number) =>
    onOpen({
      type: 'gallery',
      result: results[(index + direction + results.length) % results.length].id,
    })
  return (
    <div className="gallery-view">
      <div className="gallery-view-image">
        <Image
          src={result.image}
          alt={`${result.category}: پیش‌نمایش ناحیه درمان`}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
        />
      </div>
      <div className="gallery-view-content">
        <span className="eyebrow">گالری نتیجه‌ها · {['۰۱', '۰۲', '۰۳', '۰۴', '۰۵'][index]} / ۰۵</span>
        <h2>{result.title}</h2>
        <span className="gallery-category">{result.category}</span>
        <p>
          رویکردی سنجیده برای تناسب‌های طبیعی، با توجه به جزئیاتی که هر مراجع را یکتا می‌کند.
        </p>
        <p className="small-note">
          عکس‌های گالری صرفاً ناحیه درمان را نشان می‌دهند، نه نتیجه قبل و بعد. نتیجه در هر فرد
          متفاوت است. برای بررسی مناسب بودن و انتظارات، مشاوره لازم است.
        </p>
        <button
          className="outline-button"
          onClick={() => onOpen({ type: 'service', service: result.service })}
        >
          مشاهده خدمت <ArrowUpRight size={20} />
        </button>
        <div className="gallery-view-controls">
          <button className="circle-button" onClick={() => change(-1)} aria-label="نتیجه قبلی">
            <ArrowLeft size={22} strokeWidth={1} />
          </button>
          <span>
            {['۰۱', '۰۲', '۰۳', '۰۴', '۰۵'][index]} <span className="muted">/ ۰۵</span>
          </span>
          <button className="circle-button" onClick={() => change(1)} aria-label="نتیجه بعدی">
            <ArrowRight size={22} strokeWidth={1} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SiteOverlays({ overlay, onClose, onOpen, onNavigate }: Props) {
  const titles: Record<NonNullable<OverlayState>['type'], string> = {
    menu: 'ناوبری اصلی',
    appointment: 'درخواست مشاوره',
    service: 'جزئیات خدمت',
    calculator: 'راهنمای قیمت شخصی',
    profile: 'درباره دکتر آرمان گریگوری',
    gallery: 'پیش‌نمایش گالری',
    privacy: 'حریم خصوصی',
  }
  return (
    <AnimatePresence mode="wait">
      {overlay && (
        <Dialog key={overlay.type} kind={overlay.type} title={titles[overlay.type]} onClose={onClose}>
          {overlay.type === 'menu' && <Menu onOpen={onOpen} onNavigate={onNavigate} />}
          {overlay.type === 'appointment' && (
            <AppointmentForm service={overlay.service} initialLocation={overlay.location} onClose={onClose} />
          )}
          {overlay.type === 'calculator' && <PriceCalculator onOpen={onOpen} />}
          {overlay.type === 'profile' && <DoctorProfile onOpen={onOpen} />}
          {overlay.type === 'service' && <Procedure id={overlay.service} onOpen={onOpen} />}
          {overlay.type === 'gallery' && <Gallery id={overlay.result} onOpen={onOpen} />}
          {overlay.type === 'privacy' && (
            <div className="privacy-content">
              <span className="eyebrow">اطلاعات شما مهم است</span>
              <h2>
                حریم
                <br />
                خصوصی.
              </h2>
              <p>
                این وب‌سایت بازآفرینی طراحی و عملکرد سایت دکتر گریگوری است؛ سیستم نوبت‌دهی رسمی
                کلینیک نیست.
              </p>
              <h3>چه چیزی ذخیره می‌شود</h3>
              <p>
                اگر فرم مشاوره را ارسال کنید، نام، ایمیل، شماره تماس، خدمت انتخابی، محل مشاوره،
                تاریخ پیشنهادی و پیام شما در حافظه موقتِ همین نمونه ذخیره می‌شود. رضایت شما و زمان
                ارسال هم ثبت می‌شود.
              </p>
              <h3>درخواست شما چطور استفاده می‌شود</h3>
              <p>
                درخواست‌ها فقط برای نمایش روند مشاوره ذخیره می‌شوند. به پزشک یا کلینیک ارسال
                نمی‌شوند؛ نوبتی قطع نمی‌شود و هیچ خدمت پزشکی تنظیم نمی‌گردد. لطفاً مدارک پزشکی یا
                اطلاعات حساس سلامت ارسال نکنید.
              </p>
              <h3>کوکی و آمار</h3>
              <p>
                این بازآفرینی از کوکی تبلیغاتی، ردیاب تبلیغاتی یا آمار شخص ثالث استفاده نمی‌کند.
                تصاویر و فونت‌ها به‌صورت محلی سرو می‌شوند.
              </p>
              <h3>برای مشاوره واقعی</h3>
              <p>لطفاً برای دریافت خدمت پزشکی از وب‌سایت رسمی کلینیک استفاده کنید.</p>
              <a
                className="solid-button"
                href="https://grigoriak.doctor/contacts"
                target="_blank"
                rel="noopener noreferrer"
              >
                مشاهده وب‌سایت مرجع <ArrowUpRight size={18} />
              </a>
            </div>
          )}
        </Dialog>
      )}
    </AnimatePresence>
  )
}
