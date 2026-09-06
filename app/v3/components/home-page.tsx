'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { methodSteps } from '../lib/content'
import {
  ArrowLink,
  MaskImage,
  Reveal,
  SectionHeading,
  ease,
} from './motion-primitives'
import {
  ClientMarquee,
  ContactBand,
  OfferCards,
  ProjectGrid,
  Testimonials,
} from './sections'

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 75])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])
  return (
    <section
      ref={ref}
      className="hero"
      data-hero
      data-header-theme="light"
      aria-labelledby="v3-hero-title"
    >
      <motion.div className="hero-image" style={{ y: reduce ? 0 : y }}>
        <motion.img
          src="/images/face.jpg"
          alt="پرتره زیبایی، کلینیک جراحی پلاستیک دکتر شبنم فضلی"
          fetchPriority="high"
          loading="eager"
          // width="1856"
          // height="2464"
          // sizes="(max-width: 1856px) 84vw, 400px"

          className="w-full h-full"
          initial={{ scale: reduce ? 1 : 1.055 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.3, ease }}
        />
      </motion.div>
      <div className="hero-shade" />
      <motion.div
        className="hero-content"
        style={{ y: reduce ? 0 : textY, opacity: reduce ? 1 : opacity }}
      >
        <div className="hero-introduction">
          <motion.p
            className="eyebrow hero-eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            جراحی پلاستیک، زیبایی و ترمیمی
          </motion.p>
          <div className="hero-heading-mask">
            <motion.h1
              id="v3-hero-title"
              initial={{ y: reduce ? 0 : 95, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.5, ease }}
            >
              چهره و اندامی که همیشه خواستید؛ با ظرافت، دقت و <em>امنیت</em>{' '}
              کامل.
            </motion.h1>
          </div>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: reduce ? 0 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.9, ease }}
          >
            جراحی بینی، فیس‌لیفت، لیپوساکشن و پروتز؛
            <br />
            متناسب با آناتومی شما، با مراقبت کامل قبل، حین و بعد از جراحی.
          </motion.p>
        </div>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1, ease }}
        >
          <Link href="/v3/khadamat" className="hero-offers-link">
            مشاهده خدمات
          </Link>
          <ArrowLink href="/v3/tamas" filled>
            رزرو نوبت
          </ArrowLink>
        </motion.div>
      </motion.div>
      <a href="#hamkaran" className="hero-scroll" aria-label="آشنایی با کلینیک">
        <span />
      </a>
    </section>
  )
}

export function HomePageView() {
  return (
    <main id="v3-main-content">
      <Hero />
      <section className="clients-section" id="hamkaran">
        <SectionHeading
          eyebrow="اعتماد و همکاری"
          description="از مراکز درمانی معتبر تا انجمن‌های حرفه‌ای؛ در کنار همکاران متخصص و مورد اعتماد."
        >
          بیش از <em>۱۲٬۰۰۰ جراحی</em> موفق.
        </SectionHeading>
        <ClientMarquee />
      </section>

      <section
        className="editorial-collage content-width"
        aria-label="نگاهی به دنیای زیبایی و مراقبت"
      >
        <div className="editorial-left">
          <MaskImage
            src="/images/face.jpg"
            alt="جزئیات چهره؛ ظرافت در تخصص جراحی زیبایی"
            className="editorial-tall"
          />
          <Reveal className="editorial-caption">
            <span>جزئیات، تفاوت را می‌سازد.</span>
            <span>نگاه ما، هویت شما.</span>
          </Reveal>
        </div>
        <div className="editorial-right">
          <MaskImage
            src="/images/full-body.jpg"
            alt="فرم‌دهی بدن با رویکردی طبیعی و متناسب"
            className="editorial-wide"
          />
          <MaskImage
            src="/images/lips.webp"
            alt="تزریقات و اصلاح حجم‌های صورت با ظرافت"
            className="editorial-portrait"
          />
        </div>
      </section>

      <section className="audience-section content-width" id="studio">
        <div className="audience-visual">
          <MaskImage
            src="/images/doctor.png"
            alt="دکتر شبنم فضلی، جراح پلاستیک و زیبایی"
            className="audience-image"
          />
          <span className="image-annotation">تصویری درست. حضوری مؤثر.</span>
        </div>
        <Reveal className="audience-copy">
          <p className="eyebrow">برای چه کسانی</p>
          <h2>
            کسانی که به دنبال نتیجه‌ای <em>طبیعی</em> هستند، نه یک قالب ثابت
            زیبایی.
          </h2>
          <h3>
            ما کنار شما هستیم تا از «یک جراحی که اتفاق افتاده» به «نتیجه‌ای که
            برای شما طراحی شده» برسید.
          </h3>
          <ul className="star-list">
            <li>
              برای اولین بار تصمیم جراحی دارید و می‌خواهید از یک مسیر امن و شفاف
              شروع کنید.
            </li>
            <li>
              سؤال‌هایتان بی‌جواب مانده و به جواب‌های واقع‌بینانه، نه تبلیغاتی،
              نیاز دارید.
            </li>
            <li>
              جراحی دیگری در گذشته انجام داده‌اید و به دنبال اصلاح و ترمیم آن
              هستید.
            </li>
          </ul>
          <ArrowLink href="/v3/darbare-ma">آشنایی با دکتر فضلی</ArrowLink>
        </Reveal>
      </section>

      <section className="approach-section">
        <div className="content-width">
          <SectionHeading eyebrow="رویکرد ما">
            جراحی طراحی‌شده برای <em>چهره‌ی شما</em>، <em>ایمنی شما</em> و{' '}
            <em>آرامش</em> شما.
          </SectionHeading>
          <div className="approach-details">
            <Reveal>
              <span className="approach-star" aria-hidden="true">
                ❊
              </span>
              <h3>
                ما فقط یک عمل جراحی تحویل نمی‌دهیم.
                <br />
                یک مسیر کامل مراقبت طراحی می‌کنیم.
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p>
                هر طرح درمان با آناتومی و خواسته‌ی شما هم‌خوان می‌شود؛ نه با
                مدهای روز و قالب‌های تکراری.
              </p>
              <p>
                ایمنی، پایه‌ی همه‌ی تصمیم‌هاست: بیمارستان معتبر، تیم بیهوشی مجرب
                و مراقبت دقیق قبل، حین و بعد از عمل.
              </p>
              <p>
                و از شروع تا نتیجه‌ی نهایی کنار شما هستیم؛ ویزیت‌های منظم،
                پاسخ‌گویی سریع و راهنمای شفاف در هر مرحله.
              </p>
              <p className="approach-conclusion">
                همین نگاه کامل است که نتیجه را متفاوت می‌کند.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="method-section content-width" id="ravesh">
        <SectionHeading eyebrow="روند درمان" description="شفاف. امن. مطمئن.">
          مسیر شما از مشاوره تا <em>نتیجه‌ی نهایی</em>
          <sup> </sup>
        </SectionHeading>
        <Reveal className="method-description">
          <p>
            یک نتیجه‌ی خوب، فقط به روزِ جراحی نیست. چهار مرحله‌ی روشن، شما را از
            اولین تماس تا آخرین ویزیت همراهی می‌کند تا در هر لحظه بدانید کجا
            هستید و چه چیزی در انتظار شماست.
          </p>
          <ArrowLink href="/v3/ravesh">مشاهده‌ی روند درمان</ArrowLink>
        </Reveal>
        <div className="method-preview">
          {methodSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <Link href="/v3/ravesh">
                <span>( ۰{index + 1} )</span>
                <h3>{step.title}</h3>
                <span className="method-preview-arrow" aria-hidden="true">
                  ↖
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="offers-section" id="khadamat">
        <div className="content-width">
          <SectionHeading
            eyebrow="خدمات ما"
            description="هر نیاز، یک طرح درمان متناسب با آناتومی و خواسته‌ی شما."
          >
            خدمات پیش‌فرض وجود ندارد.
            <br />
            یک طرح برای <em>شما</em> طراحی می‌شود.
          </SectionHeading>
          <OfferCards />
          <Reveal className="section-bottom-link">
            <ArrowLink href="/v3/khadamat">مشاهده‌ی همه‌ی خدمات</ArrowLink>
          </Reveal>
        </div>
      </section>

      <section className="projects-section content-width" id="nemune">
        <SectionHeading
          eyebrow="نمونه‌کارها"
          description="تخصص ویژه در جراحی‌های صورت و بینی، بدن و اندام و تزریقات."
        >
          برخی از <em>خدماتی</em> که در کلینیک ارائه می‌شود.
        </SectionHeading>
        <ProjectGrid editorial />
        <Reveal className="section-bottom-link">
          <ArrowLink href="/v3/nemune-karha">همه‌ی نمونه‌کارها</ArrowLink>
        </Reveal>
      </section>

      <section className="awards-section" id="tavan">
        <div className="content-width">
          <SectionHeading eyebrow="اعداد، به جای ادعا">
            سابقه‌ای که <em>اعتماد</em> می‌سازد.
          </SectionHeading>
          <div className="award-list">
            {[
              {
                year: '۱۵+',
                name: 'سال تجربه جراحی پلاستیک، زیبایی و ترمیمی',
                org: 'از سال ۱۳۸۸ تاکنون',
                type: 'تجربه',
              },
              {
                year: '۱۲٬۰۰۰+',
                name: 'جراحی موفق بینی، صورت و بدن',
                org: 'با تکنیک‌های به‌روز و کم‌تهاجمی',
                type: 'سابقه',
              },
              {
                year: '۹۸٪',
                name: 'رضایت مراجعان بر اساس دیدگاه‌های ثبت‌شده',
                org: 'نظرات واقعی بیماران کلینیک',
                type: 'اعتماد',
              },
            ].map((award, i) => (
              <Reveal className="award-row" key={award.year} delay={i * 0.06}>
                <span className="award-year">{award.year}</span>
                <h3>{award.name}</h3>
                <span className="award-org">{award.org}</span>
                <span className="award-type">{award.type}</span>
                <span aria-hidden="true">↖</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Testimonials />
      <ContactBand />
    </main>
  )
}
