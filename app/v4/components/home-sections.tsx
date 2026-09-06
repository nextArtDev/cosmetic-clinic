'use client'

import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react'
import {
  articles,
  caseExamples,
  faqs,
  reasons,
  treatments,
} from '../lib/clinic-data'
import {
  ease,
  Instagram,
  Magnetic,
  Reveal,
  SectionHeading,
  Star,
  TextButton,
  Whatsapp,
} from './ui'

export function NewsStrip({ onArticle }: { onArticle: (id: string) => void }) {
  return (
    <section className="news-strip inner" aria-label="اخبار">
      <h2 className="serif">اخبار</h2>
      <div className="news-items">
        {articles.slice(0, 2).map((article) => (
          <button
            className="news-item"
            key={article.id}
            onClick={() => onArticle(article.id)}
          >
            <div className="news-thumb">
              <img src={article.image} alt="" />
            </div>
            <div className="news-content">
              <div className="news-meta">
                <time>{article.date}</time>
                <span>{article.category}</span>
              </div>
              <h3>{article.title}</h3>
            </div>
            <ArrowUpRight className="news-arrow" size={16} strokeWidth={1.3} />
          </button>
        ))}
      </div>
    </section>
  )
}

export function Introduction() {
  return (
    <>
      <section id="about" className="intro-section section-space inner">
        <Reveal className="intro-heading">
          <span className="eyebrow">
            <Star />
            فلسفهٔ ما
          </span>
          <h2>
            بیدار کردنِ
            <br />
            <span>زیبایی</span>
          </h2>
          <p className="serif">Evoke your true beauty.</p>
        </Reveal>
        <Reveal className="intro-copy" delay={0.12}>
          <p>
            ما کلینیک تخصصی زیبایی هستیم؛
            <br />
            برای همهٔ شما که زیبایی را جدی می‌گیرید.
          </p>
          <p>
            مشاوره را جدی می‌گیریم و<br />
            «می‌خواهم زیباتر شوم» و «می‌خواهم جوان‌تر به نظر برسم» را
            <br />
            با تمام توان پاسخ می‌دهیم تا تجربه‌ای که در کلینیک
            <br />
            دکتر شبنم فضلی دارید، مراقبت از زیبایی را برایتان
            <br />
            نزدیک‌تر و لذت‌بخش‌تر کند.
          </p>
          <h3>پزشکی زیبایی، همراهِ شماست.</h3>
          <p>
            فوق تخصص باتجربه و تیمی مهربان،
            <br />
            با لبخند از شما استقبال می‌کنند.
          </p>
          <a href="#reasons" className="intro-next">
            <span>آنچه برای ما اهمیت دارد</span>
            <ArrowDown size={17} strokeWidth={1.2} />
          </a>
        </Reveal>
      </section>
      <div className="beauty-marquee" aria-hidden="true">
        <div>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="serif">
              زیباییِ واقعی‌ات را بیدار کن
              <Star />
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

export function ClinicReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      'ellipse(34% 46% at 50% 50%)',
      'ellipse(72% 76% at 50% 50%)',
      'ellipse(90% 85% at 50% 50%)',
    ],
  )
  const y = useTransform(scrollYProgress, [0, 1], [-45, 45])
  return (
    <section
      className="clinic-reveal"
      ref={ref}
      aria-label="فضایی دلنشین، برای استقبال از شما"
    >
      <motion.div
        className="clinic-reveal-mask"
        style={{ clipPath: reduced ? undefined : clipPath }}
      >
        <motion.img
          src="/images/personels2.jpg"
          alt="فضای داخلی کلینیک دکتر شبنم فضلی"
          loading="lazy"
          style={{ y: reduced ? 0 : y }}
        />
        <div className="clinic-reveal-shade" />
        <Reveal className="clinic-reveal-copy">
          <Star />
          <p>جایی دلنشین، برای شما.</p>
          <h2 className="serif">فقط خودت باش.</h2>
        </Reveal>
      </motion.div>
    </section>
  )
}

export function ReasonsSection() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (window.innerWidth > 900 && !reduced)
      setActive(Math.min(2, Math.max(0, Math.floor(value * 3))))
  })
  function select(index: number) {
    setActive(index)
    if (window.innerWidth > 900 && ref.current && !reduced) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY
      const travel = ref.current.offsetHeight - window.innerHeight
      window.scrollTo({
        top: top + travel * ((index + 0.15) / 3),
        behavior: 'smooth',
      })
    }
  }
  return (
    <section className="reasons-track" id="reasons" ref={ref}>
      <div className="reasons-sticky">
        <div className="reasons-inner inner">
          <div className="reasons-intro">
            <SectionHeading en="چرا ما؟" fa="دلایل انتخاب" />
            <h3>
              چرا کلینیک
              <br />
              دکتر شبنم فضلی؟
            </h3>
            <p>
              فوق تخصصی باتجربه و تیمی دلسوز کنار شماست
              <br />
              تا دغدغه‌هایتان با خیال راحت حل شود.
            </p>
            <div className="reason-switcher">
              <div className="reason-pages">
                {reasons.map((_, index) => (
                  <button
                    key={index}
                    className={active === index ? 'active' : ''}
                    aria-label={`دلیل انتخاب ${index + 1}`}
                    aria-pressed={active === index}
                    onClick={() => select(index)}
                  >
                    <span>۰{index + 1}</span>
                  </button>
                ))}
              </div>
              <span className="reason-step-label">قول ما به شما</span>
            </div>
          </div>
          <div className="reason-display">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={active}
                className="reason-card"
                initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                animate={{ opacity: 0.7, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -18 }}
                transition={{ duration: 0.55, ease }}
              >
                <span className="reason-number serif">۰{active + 1}</span>
<div className="reason-photo">
<img src={reasons[active].image} alt={reasons[active].title.replace('\n', '')} loading="lazy" />
                 </div>
                <h3>{reasons[active].title}</h3>
                <p>{reasons[active].description}</p>
                <div className="reason-bottom-line">
                  <img src="/v4/images/shine.svg" alt="" />
                  <span />
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
        <span className="reason-watermark serif" aria-hidden="true">
          کلینیک فضلی
        </span>
      </div>
    </section>
  )
}

export function Recommended({
  onTreatment,
}: {
  onTreatment: (id: string) => void
}) {
  return (
    <section
      className="recommended-section section-space inner"
      id="recommended"
    >
      <Reveal className="recommended-heading">
        <SectionHeading en="پیشنهاد ما" fa="خدمات برگزیده" />
        <p>
          به سمت نسخهٔ زیباتر خودتان؛
          <br />
          خدمتی متناسب با شما.
        </p>
      </Reveal>
      <div className="recommended-list">
        {treatments.map((treatment, index) => (
          <Reveal
            className={`treatment-row treatment-row-${index + 1}`}
            key={treatment.id}
          >
            <div className="treatment-row-copy">
              <span className="treatment-number serif">۰{index + 1}</span>
              <p className="treatment-english serif">{treatment.english}</p>
              <h3>{treatment.title}</h3>
              <div className="tag-list">
                {treatment.tags.map((tag) => (
                  <span key={tag}># {tag}</span>
                ))}
              </div>
              <p className="treatment-description">{treatment.description}</p>
              <TextButton onClick={() => onTreatment(treatment.id)}>
                جزئیات این خدمت
              </TextButton>
            </div>
            <button
              className="treatment-photo"
              onClick={() => onTreatment(treatment.id)}
              aria-label={`جزئیات ${treatment.title}`}
            >
              <img src={treatment.image} alt={treatment.title} loading="lazy" />
              <span className="photo-hover-label serif">
                مشاهده
                <ArrowUpRight size={20} strokeWidth={1.2} />
              </span>
              <span className="treatment-photo-index">
                کلینیک فضلی / ۰{index + 1}
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

const concerns = [
  {
    id: 'nose',
    title: 'فرم بینی',
    en: 'رینوپلاستی',
    icon: '01',
    treatment: 'rhinoplasty',
  },
  {
    id: 'aging',
    title: 'افتادگی و چروک',
    en: 'لیفت صورت',
    icon: '11',
    treatment: 'facelift',
  },
  {
    id: 'body',
    title: 'چربی موضعی',
    en: 'لیپوساکشن',
    icon: '15',
    treatment: 'liposuction',
  },
  {
    id: 'eyelid',
    title: 'پلک و اطراف چشم',
    en: 'بلفاروپلاستی',
    icon: '03',
    treatment: 'facelift',
  },
  {
    id: 'inject',
    title: 'ژل و فیلر',
    en: 'تزریقات',
    icon: '13',
    treatment: null,
  },
  {
    id: 'skin',
    title: 'لک و شفافیت پوست',
    en: 'پوست',
    icon: '09',
    treatment: 'injectables',
  },
]

export function TreatmentMenu({
  onTreatment,
  onPrice,
  onBook,
}: {
  onTreatment: (id: string) => void
  onPrice: () => void
  onBook: (title?: string) => void
}) {
  const [category, setCategory] = useState('concerns')
  const [selected, setSelected] = useState<string | null>(null)
  const concern = concerns.find((item) => item.id === selected)
  return (
    <section id="treatments" className="treatment-menu-section section-space">
      <div className="inner">
        <Reveal className="menu-title-row">
          <SectionHeading en="خدمات کلینیک" fa="منوی خدمات" />
          <p>دغدغهٔ خود را با ما در میان بگذارید.</p>
        </Reveal>
        <Reveal className="treatment-menu-panel">
          <div
            className="menu-tabs"
            role="tablist"
            aria-label="نحوهٔ مشاهدهٔ خدمات"
          >
            {[
              { id: 'concerns', label: 'بر اساس دغدغه' },
              { id: 'surgery', label: 'جراحی' },
              { id: 'skin', label: 'تزریقی و پوست' },
            ].map((tab) => (
              <button
                role="tab"
                aria-selected={category === tab.id}
                key={tab.id}
                onClick={() => {
                  setCategory(tab.id)
                  setSelected(null)
                }}
                className={category === tab.id ? 'active' : ''}
              >
                {tab.label}
                {category === tab.id && (
                  <motion.span
                    layoutId="menu-tab-indicator"
                    className="menu-tab-indicator"
                  />
                )}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.25 }}
            >
              {category === 'concerns' ? (
                <>
                  <div className="concerns-grid">
                    {concerns.map((item) => (
                      <button
                        key={item.id}
                        className={selected === item.id ? 'active' : ''}
                        aria-expanded={selected === item.id}
                        onClick={() =>
                          setSelected(selected === item.id ? null : item.id)
                        }
                      >
                        <span className="concern-icon">
                          <img
                            src={`/v4/images/parts-${item.icon}.svg`}
                            alt=""
                          />
                        </span>
                        <strong>{item.title}</strong>
                        <span className="serif">{item.en}</span>
                        <Plus size={14} strokeWidth={1.2} />
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {concern && (
                      <motion.div
                        className="concern-result"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div>
                          <span>برای دغدغهٔ {concern.title}</span>
                          <button
                            onClick={() =>
                              concern.treatment
                                ? onTreatment(concern.treatment)
                                : onBook('مزوتراپی')
                            }
                          >
                            {concern.treatment
                              ? treatments.find(
                                  (item) => item.id === concern.treatment,
                                )?.title
                              : 'دربارهٔ مزوتراپی مشورت کنید'}
                            <ArrowUpRight size={18} />
                          </button>
                          <p>
                            انتخاب روش مناسب را پزشک پس از معاینه پیشنهاد
                            می‌کند.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="menu-treatment-list">
                  {treatments
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onTreatment(item.id)}
                      >
                        <img src={item.image} alt="" />
                        <span>
                          <strong>{item.title}</strong>
                          <small className="serif">{item.english}</small>
                        </span>
                        <ArrowUpRight size={22} strokeWidth={1.2} />
                      </button>
                    ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div id="price" className="menu-price-link">
            <span>برای مشاهدهٔ تعرفه‌های خدمات</span>
            <TextButton onClick={onPrice}>مشاهدهٔ تعرفه‌ها</TextButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function DoctorSection({ onBook }: { onBook: () => void }) {
  return (
    <section id="doctor" className="doctor-section section-space inner">
      <Reveal className="doctor-visual">
        <div className="doctor-photo">
          <img
            src="/images/doctor-model.webp"
            alt="دکتر شبنم فضلی"
            className="object-contain! opacity-80"
          />
        </div>
        <Star className="doctor-star" stroke />
        <p className="doctor-photo-caption serif">Expertise with empathy.</p>
      </Reveal>
      <Reveal className="doctor-copy" delay={0.1}>
        <SectionHeading en="دکتر شما" fa="معرفی پزشک" />
        <h3>
          به «خواستهٔ» شما،
          <br />
          صادقانه و دقیق پاسخ می‌دهیم.
        </h3>
        <p>
          پزشکی زیبایی می‌تواند هر روزِ زندگی را دلپذیرتر کند؛
          <br />
          ما دوست داریم نخستین قدمِ این مسیر را کنار شما برداریم.
        </p>
        <p>
          از مشاوره تا عمل و مراقبت‌های بعد از آن،
          <br />
          با دغدغه‌های تک‌تک شما همدلی می‌کنیم و مسئولیت کامل مسیر را می‌پذیریم.
          <br />
          سؤال کوچکی هم دارید، بدون نگرانی بپرسید.
        </p>
        <div className="doctor-name">
          <span>فوق تخصص جراحی پلاستیک، زیبایی و ترمیمی</span>
          <h4>
            دکتر شبنم فضلی<small className="serif">Dr. Shabnam Fazli</small>
          </h4>
        </div>
        <TextButton onClick={onBook}>رزرو مشاوره</TextButton>
      </Reveal>
    </section>
  )
}

export function CasesSection({ onCase }: { onCase: (id: string) => void }) {
  const [category, setCategory] = useState('all')
  return (
    <section id="cases" className="cases-section section-space">
      <div className="inner">
        <Reveal className="cases-heading">
          <SectionHeading en="نمونه‌کارها" fa="قبل و بعد" />
          <p>تغییرهای کوچک، اعتمادبه‌نفسِ روزمره.</p>
        </Reveal>
        <div
          className="filter-tabs case-filters"
          role="tablist"
          aria-label="دسته‌بندی نمونه‌کارها"
        >
          {[
            { id: 'all', label: 'همه' },
            { id: 'face', label: 'صورت و بینی' },
            { id: 'injectables', label: 'تزریقات' },
          ].map((item) => (
            <button
              role="tab"
              aria-selected={category === item.id}
              className={category === item.id ? 'active' : ''}
              key={item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <motion.div layout className="case-grid">
          <AnimatePresence mode="popLayout">
            {caseExamples
              .filter(
                (item) => category === 'all' || item.category === category,
              )
              .map((item) => (
                <motion.button
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease }}
                  className="case-card"
                  onClick={() => onCase(item.id)}
                >
                  <div className="case-image">
                    <img
                      src={item.image}
                      alt={`نمونهٔ ${item.title}`}
                      loading="lazy"
                    />
                    <span className="case-view">
                      <ArrowUpRight size={22} strokeWidth={1.2} />
                    </span>
                  </div>
                  <div className="case-text">
                    <span className="eyebrow">{item.number} / نمونهٔ کار</span>
                    <h3>{item.title}</h3>
                    <p>{item.subtitle}</p>
                  </div>
                </motion.button>
              ))}
          </AnimatePresence>
        </motion.div>
        <p className="case-disclaimer">
          ※ نتیجهٔ عمل‌ها در افراد مختلف متفاوت است؛ جزئیات، هزینه و ریسک هر
          نمونه را در بخش توضیحات همان نمونه ببینید.
        </p>
      </div>
    </section>
  )
}

export function JournalSection({
  onArticle,
}: {
  onArticle: (id: string) => void
}) {
  return (
    <section id="journal" className="journal-section section-space inner">
      <Reveal className="journal-heading">
        <SectionHeading en="مجلهٔ زیبایی" fa="خواندنی‌ها" />
        <p>بیشتر بدانید، بیشتر خودتان را دوست بدارید.</p>
      </Reveal>
      <div className="journal-grid">
        {articles.map((article, index) => (
          <Reveal delay={index * 0.08} key={article.id}>
            <button
              className="journal-card"
              onClick={() => onArticle(article.id)}
            >
              <div className="journal-image">
<img src={article.image} alt="" loading="lazy" />
                <span>
                  <ArrowUpRight size={20} strokeWidth={1.3} />
                </span>
              </div>
              <div className="journal-meta">
                <time>{article.date}</time>
                <span>{article.category}</span>
              </div>
              <h3>{article.title}</h3>
              <span className="journal-read serif">
                مطالعهٔ مطلب
                <ArrowLeft size={16} strokeWidth={1.1} />
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function FAQSection() {
  const [opened, setOpened] = useState<number | null>(null)
  return (
    <section id="faq" className="faq-section section-space inner">
      <Reveal className="faq-heading">
        <SectionHeading en="خیالتان راحت." fa="سوالات متداول" />
        <p>نخستین قدم، با آسودگی.</p>
        <img src="/v4/images/pegasus.svg" alt="" />
      </Reveal>
      <div className="faq-list">
        {faqs.map((item, index) => (
          <Reveal key={item.question} delay={index * 0.04}>
            <article className={`faq-item ${opened === index ? 'opened' : ''}`}>
              <h3>
                <button
                  onClick={() => setOpened(opened === index ? null : index)}
                  aria-expanded={opened === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="faq-q serif">؟</span>
                  <span>{item.question}</span>
                  <span className="faq-toggle">
                    {opened === index ? (
                      <Minus size={17} strokeWidth={1.2} />
                    ) : (
                      <Plus size={17} strokeWidth={1.2} />
                    )}
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {opened === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <p>{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function ContactFooter({
  onBook,
  onCalendar,
  onPrice,
  onPrivacy,
}: {
  onBook: () => void
  onCalendar: () => void
  onPrice: () => void
  onPrivacy: () => void
}) {
  return (
    <>
      <section id="contact" className="contact-section">
        <div className="contact-grain" />
        <div className="inner">
          <Reveal className="contact-heading">
            <div>
              <span className="eyebrow">رزرو و ارتباط</span>
              <h2 className="serif">تماس با ما</h2>
            </div>
            <Star className="contact-mark" />
          </Reveal>
          <Reveal className="contact-body">
            <h3>
              به سمت زیباییِ خودتان،
              <br />
              نخستین قدم را بردارید.
            </h3>
            <div>
              <p>
                گفت‌وگو با مراجعان برایمان اهمیت دارد؛
                <br />
                پذیرش فقط با نوبت قبلی انجام می‌شود.
                <br />
                لطفاً پیش از مراجعه، رزرو کنید.
              </p>
              <a className="contact-phone serif" href="tel:0935121212">
                <small>tel.</small>0935 121 212
              </a>
              <span className="contact-hours">
                ساعات پاسخگویی ۹:۰۰ تا ۱۸:۰۰
              </span>
            </div>
          </Reveal>
          <Reveal className="contact-buttons">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <div>
                <span className="serif">واتس‌اپ</span>
                <small>گفتگوی آنلاین</small>
              </div>
              <ArrowUpRight size={25} strokeWidth={1.2} />
            </a>
            <button onClick={onBook}>
              <div>
                <span className="serif">رزرو آنلاین</span>
                <small>رزرو از طریق سایت</small>
              </div>
              <ArrowUpRight size={25} strokeWidth={1.2} />
            </button>
          </Reveal>
        </div>
        <Star className="contact-star-one" stroke />
        <Star className="contact-star-two" stroke />
      </section>
      <footer className="site-footer">
        <div id="access" className="footer-main inner">
          <div className="footer-clinic">
            <a href="#top" className="footer-logo">
              <span className="footer-logo-text">
                دکتر شبنم فضلی
                <small>فوق تخصص جراحی پلاستیک، زیبایی و ترمیمی</small>
              </span>
            </a>
            <p className="footer-specialty">جراحی پلاستیک و زیبایی</p>
            <p>
              اصفهان، خیابان رودکی
              <br />
              کلینیک دکتر شبنم فضلی
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=کلینیک+دکتر+شبنم+فضلی+اصفهان"
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              <MapPin size={15} strokeWidth={1.2} />
              <span>مشاهدهٔ روی نقشه</span>
              <ArrowUpRight size={16} />
            </a>
            <div className="footer-socials">
              <a href="#" aria-label="اینستاگرام">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="واتس‌اپ">
                <Whatsapp size={20} />
              </a>
              <a href="#" aria-label="تلگرام">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="m21.5 4.5-19 7.5 6 2 2 6 3.5-4.5 5 3.5 2.5-14.5Z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-navigation">
            <a href="#about">دربارهٔ کلینیک</a>
            <a href="#doctor">دکتر فضلی</a>
            <a href="#treatments">خدمات</a>
            <button onClick={onPrice}>تعرفه‌ها</button>
            <a href="#journal">مجلهٔ زیبایی</a>
            <a href="#cases">نمونه‌کارها</a>
            <a href="#faq">سوالات متداول</a>
            <button onClick={onPrivacy}>حریم خصوصی</button>
          </div>
          <div className="footer-schedule">
            <span className="eyebrow">ساعات پذیرش</span>
            <p className="serif">۹:۰۰ – ۱۸:۰۰</p>
            <span>آخرین زمان مشاوره ۱۷:۰۰</span>
            <span>تعطیل: جمعه‌ها</span>
            <TextButton onClick={onCalendar}>
              <CalendarDays size={16} strokeWidth={1.2} />
              تقویم پذیرش
            </TextButton>
          </div>
        </div>
        <div className="footer-bottom inner">
          <small>© کلینیک دکتر شبنم فضلی — بازطراحی نمونه.</small>
          <span>نمونهٔ غیررسمی؛ رزرو واقعی ثبت نمی‌شود</span>
          <Magnetic>
            <a
              href="#top"
              className="back-to-top"
              aria-label="بازگشت به بالای صفحه"
            >
              <span className="serif">بازگشت به بالا</span>
              <ArrowUp size={18} strokeWidth={1.2} />
            </a>
          </Magnetic>
        </div>
      </footer>
    </>
  )
}
