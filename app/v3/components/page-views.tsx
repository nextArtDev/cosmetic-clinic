'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { expertise, methodSteps, offers, projects, type Project } from '../lib/content'
import { ArrowIcon, ArrowLink, MaskImage, Reveal, SectionHeading, ease } from './motion-primitives'
import { Accordion, ClientMarquee, ContactBand, ProjectGrid, Testimonials } from './sections'
import { ContactForm } from './contact-form'

function PageIntro({ eyebrow, children, description }: { eyebrow: string; children: ReactNode; description?: string }) {
  return <section className="page-intro content-width"><motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>{eyebrow}</motion.p><div className="page-title-mask"><motion.h1 initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.1, ease }}>{children}</motion.h1></div>{description && <motion.p className="page-intro-description" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>{description}</motion.p>}</section>
}

function KhadamatPage() {
  return <><PageIntro eyebrow="خدمات ما" description="هر طرح درمان، دقیقاً متناسب با آناتومی و خواسته‌ی شما طراحی می‌شود.">خدمات پیش‌فرض وجود ندارد.<br />یک طرح برای <em>شما</em> طراحی می‌شود.</PageIntro><div className="offer-details content-width">{offers.map((offer, index) => <section className={`offer-detail ${index % 2 ? 'offer-detail--reverse' : ''}`} id={offer.id} key={offer.id}><MaskImage src={offer.image} alt={offer.name} className="offer-detail-image" /><Reveal className="offer-detail-copy"><p className="eyebrow">۰{index + 1} — {offer.label}</p><h2>{offer.name}</h2><h3>{offer.description}</h3><p>{offer.intro}</p><ul>{offer.features.map(feature => <li key={feature}><span aria-hidden="true">❊</span>{feature}</li>)}</ul><ArrowLink href={`/v3/tamas?khadamat=${encodeURIComponent(offer.name)}`} filled>گفت‌وگو در مورد طرح من</ArrowLink><p className="offer-detail-note">هر درمان کاملاً شخصی‌سازی می‌شود. طرح شما هم همین‌طور.</p></Reveal></section>)}</div><section className="faq-section content-width"><SectionHeading eyebrow="چند پاسخ روشن">شاید این سؤال‌ها<br /><em>ذهن شما را هم گرفته.</em></SectionHeading><Accordion items={[{ title: 'از کجا بفهمم کدام خدمت برای من مناسب است؟', text: 'در جلسه‌ی مشاوره، وضعیت شما کامل معاینه و بررسی می‌شود و صادقانه گفته می‌شود کدام گزینه به نتیجه‌ی دلخواه‌تان نزدیک‌تر است؛ بدون سرویس اضافه و بدون اصرار روی یک روش خاص.' }, { title: 'بعد از جراحی، مراقبت چطور انجام می‌شود؟', text: 'همه‌ی مراحل از ویزیت تا پانسمان و پیگیری تا نتیجه‌ی نهایی، با راهنمای کتبی و تماس منظم همراهی می‌شود. هر وقت سوالی پیش بیاید، تیم کلینیک پاسخ‌گوست.' }, { title: 'روند کار چگونه پیش می‌رود؟', text: 'مسیر درمان چهار مرحله دارد: مشاوره، طراحی نقشه‌ی درمان، جراحی و مراقبت و پیگیری. در هر مرحله پاسخ‌گوی سؤال‌های شما هستیم و نقطه‌های تصمیم‌گیری با خود شماست.' }, { title: 'هزینه‌ها چگونه تعیین می‌شود؟', text: 'هزینه بر اساس نوع جراحی، تکنیک انتخابی و بیمارستان مشخص می‌شود و در جلسه‌ی مشاوره به‌صورت شفاف اعلام می‌گردد؛ بدون هزینه‌های پنهان و غافلگیری.' }]} /></section><ContactBand /></>
}

function NemuneKarhaPage() {
  return <><PageIntro eyebrow="نمونه‌کارها" description="دیدگاه ما به هر مورد درمانی، از جلسه‌ی مشاوره تا نتیجه‌ی نهایی.">نمونه‌هایی از خدماتی که در کلینیک<br /><em>ارائه می‌شود.</em></PageIntro><section className="portfolio-page content-width"><ProjectGrid filterable /></section><ContactBand /></>
}

function DarbareMaPage() {
  return <><PageIntro eyebrow="درباره کلینیک" description="یک نگاه تخصصی. یک استاندارد بالینی. و توجه کامل به هر جزئیات.">یک جراح، یک کلینیک،<br />یک هدف: <em>نتیجه‌ی شما.</em></PageIntro><section className="about-story content-width"><MaskImage src="/images/doctor.png" alt="دکتر شبنم فضلی، جراح پلاستیک و زیبایی" className="about-story-image" /><Reveal className="about-story-copy"><p className="eyebrow">دکتر شبنم فضلی</p><h2>دقت جراحی.<br />نگاه هنری.<br /><em>و مسئولیت کامل.</em></h2><p>دکتر شبنم فضلی، جراح پلاستیک، زیبایی و ترمیمی است که با تکیه بر سال‌ها تجربه در جراحی‌های صورت، بینی و بدن، مسیری امن و شفاف برای مراجعان‌اش طراحی می‌کند.</p><p>او باور دارد که جراحی زیبایی باید هویت چهره‌ی شما را حفظ کند و فقط آن را در بهترین نسخه‌اش نشان دهد؛ نتیجه‌ای که دوستانتان تعجب کنند اما نتوانند بگویند «عمل کرده».</p><p>رویکرد کلینیک ترکیبی از استانداردهای بالینی روز دنیا، تکنیک‌های کم‌تهاجمی و پیگیری دقیق بعد از جراحی است.</p><ArrowLink href="/v3/bayan">خواندن فلسفه ما</ArrowLink></Reveal></section><section className="studio-stats content-width"><Reveal><span>۱۵<sup>+</sup></span><p>سال تجربه جراحی</p></Reveal><Reveal delay={0.1}><span>۱۳۸۸</span><p>شروع مسیر حرفه‌ای</p></Reveal><Reveal delay={0.2}><span>۹۸<sup>٪</sup></span><p>رضایت مراجعان</p></Reveal></section><section className="about-clients"><SectionHeading eyebrow="اعتماد ساخته می‌شود">از مراکز درمانی معتبر<br />تا <em>انجمن‌های حرفه‌ای.</em></SectionHeading><ClientMarquee /></section><Testimonials /><ContactBand /></>
}

function TamasPage() {
  return <><PageIntro eyebrow="گفت‌وگو در مورد طرح شما" description="ایده، نگرانی یا خواسته‌ای دارید؟ خوشحال می‌شویم بشنویم.">از یک گفت‌وگوی <em>ساده</em><br />شروع می‌شود.</PageIntro><section className="contact-layout content-width"><Reveal className="contact-sidebar"><p className="eyebrow">اولین دیدار</p><h2>همه‌چیز با یک<br /><em>گفت‌وگو</em> شروع می‌شود.</h2><p>در مورد خودتان و آنچه برای آینده تصور می‌کنید بنویسید. وقت کافی می‌گذاریم تا پرونده‌تان را کامل بفهمیم.</p><div className="contact-direct"><a href="mailto:clinic@drshabnamfazli.com">clinic@drshabnamfazli.com <ArrowIcon diagonal /></a><a href="tel:02128424567">۰۲۱ ۲۸۴۲ ۴۵۶۷ <ArrowIcon diagonal /></a></div><div className="contact-availability"><span /><p>پاسخ‌گوی شما هستیم<br /><small>پاسخ‌گویی کمتر از ۲۴ ساعت — بدون تعهد</small></p></div><MaskImage src="/images/face.jpg" alt="جزئیات و ظرافت، در قلب رویکرد ما" className="contact-sidebar-image" parallax={false} /></Reveal><ContactForm /></section></>
}

function RaveshPage() {
  return <><PageIntro eyebrow="روند درمان" description="شفاف. امن. مطمئن.">از مشاوره تا<br /><em>نتیجه‌ی نهایی.</em></PageIntro><Reveal className="method-page-lead content-width"><p>جراحی زیبایی، فقط یک تصمیم روزِ عمل نیست؛ یک مسیر است. از اولین سؤال شما تا آخرین ویزیت، هر مرحله با برنامه و روشن همراهی می‌شود.</p><p>روند ما، مشاوره و طراحی را به جراحی و مراقبت گره می‌زند.</p></Reveal><section className="method-steps content-width">{methodSteps.map((step, index) => <Reveal className="method-step" key={step.title}><span className="step-number">۰{index + 1}</span><div><p className="eyebrow">روند درمان</p><h2>{step.title}</h2><p>{step.text}</p></div><span className="step-flower" aria-hidden="true">❊</span></Reveal>)}</section><ContactBand /></>
}

function TakhasoshaPage() {
  return <><PageIntro eyebrow="تخصص‌ها" description="هر تخصص، در قالب یک نگاه کامل و تیمی.">چهره، بدن، پوست؛<br />برای ساختن <em>نسخه‌ی بهترین شما.</em></PageIntro><section className="expertise-content content-width"><div className="expertise-image"><MaskImage src="/images/doctor-model.webp" alt="ظرافت در تخصص جراحی زیبایی" className="expertise-portrait" /><p className="eyebrow">یک نگاه کامل.<br />به جزئیات.</p></div><Accordion items={expertise} /></section><ContactBand /></>
}

function NavahiPage() {
  const sectors = [{ title: 'صورت و بینی', image: 'rhino', text: 'جراحی بینی، فیس‌لیفت و بلفاروپلاستی با حفظ هویت چهره.' }, { title: 'بدن و اندام', image: 'liposuction', text: 'لیپوساکشن و ابدومینوپلاستی برای فرم‌دهی طبیعی و متناسب.' }, { title: 'سینه', image: 'breast', text: 'پروتز، لیفت و کوچک‌سازی با انتخاب دقیق و تناسب طبیعی.' }, { title: 'تزریقات و پوست', image: 'injectables', text: 'تزریق ژل و بوتاکس توسط پزشک، با دوز محاسبه‌شده و نتیجه‌ای طبیعی.' }]
  return <><PageIntro eyebrow="نواحی درمان" description="یک رویکرد شخصی، برای مشکلاتی که می‌شناسیم.">بدن شما.<br />نگاه ما. <em>نتیجه‌ی مشترک.</em></PageIntro><section className="sector-grid content-width">{sectors.map((sector, index) => <Reveal className="sector-card" key={sector.title}><MaskImage src={`/images/a/${sector.image}.webp`} alt={`تخصص کلینیک در ${sector.title}`} className="sector-image" /><div className="sector-copy"><span className="eyebrow">۰{index + 1}</span><h2>{sector.title}</h2><p>{sector.text}</p><ArrowLink href="/v3/tamas">طرح خودمان را بچینیم</ArrowLink></div></Reveal>)}</section><ContactBand /></>
}

function BayanPage() {
  const beliefs = [{ title: 'زیبایی باید هویت داشته باشد.', text: 'ما برای تکرار یک قالب زیبایی کار نمی‌کنیم. برای نشان دادن بهترین نسخه‌ی خودتان کار می‌کنیم؛ با دقت و تعادل.' }, { title: 'تفاوت، تمرین می‌خواهد.', text: 'یک جراح قوی، خودش را با دیگران مقایسه نمی‌کند. تجربه‌ی خودش، استانداردهای بالینی و نگاهی منحصربه‌فرد دارد.' }, { title: 'جزئیات، هرگز جزئیات نیست.', text: 'از انتخاب تکنیک جراحی تا نوع پانسمان، هر تصمیم روی نتیجه‌ی نهایی و تجربه‌ی شما اثر می‌گذارد.' }, { title: 'ما با هم پیش می‌رویم.', text: 'اعتماد، شنیدن و گفت‌وگو پایه‌ی هر پروژه‌ی خوب است. خواسته‌ی شما، برنامه‌ی ماست؛ از اولین جلسه تا آخرین ویزیت.' }]
  return <><PageIntro eyebrow="فلسفه ما">زیبایی به‌تنهایی کافی نیست.<br />باید <em>معنا</em> داشته باشد.</PageIntro><section className="manifesto content-width">{beliefs.map((belief, i) => <Reveal className="manifesto-belief" key={belief.title}><span>( ۰{i + 1} )</span><div><h2>{belief.title}</h2><p>{belief.text}</p></div></Reveal>)}</section><ContactBand /></>
}

function LegalPage({ slug }: { slug: string }) {
  const title = slug === 'mogharrarat' ? 'مقررات قانونی' : slug === 'sharaet' ? 'شرایط استفاده' : 'حریم خصوصی'
  return <><PageIntro eyebrow="اطلاعات">{title}</PageIntro><article className="legal-content content-width"><h2>درباره این رابط</h2><p>این صفحه، نمونه‌ای فنی و دمو از طراحی سایت کلینیک دکتر شبنم فضلی است و محتوای آن مربوط به این نسخه‌ی دمو است. این نسخه جایگزین سایت رسمی کلینیک نیست.</p><h2>اطلاعات شخصی شما</h2><p>اطلاعات فرم تماس برای پاسخ به درخواست شما ذخیره می‌شود و به هیچ شخص ثالثی داده نمی‌شود. فیلدهای ستاره‌دار برای درک درخواست شما لازم هستند.</p><p>لطفاً اطلاعات حساس پزشکی را در فرم وارد نکنید. برای دسترسی، اصلاح یا حذف درخواست، با شماره‌ی ثبت‌شده در فرم تماس با ما تماس بگیرید.</p><h2>کوکی‌ها و تنظیمات</h2><p>این نسخه هیچ سرویس ردیابی تبلیغاتی یا سنجش بازدید شخص ثالثی را بارگذاری نمی‌کند. ترجیحات شما به‌صورت محلی در مرورگر نگه داشته می‌شود و با دکمه‌ی «مدیریت رضایت» هر زمان قابل تغییر است.</p><h2>مالکیت معنوی</h2><p>متون، تصاویر و محتوای این نسخه فقط برای نمایش طراحی استفاده شده و بازنشر آن‌ها بدون اجازه‌ی صاحبان اثر مجاز نیست.</p><h2>درخواست و خدمات</h2><p>فرم تماس، هیچ تعهدی برای خدمات و پرداخت ایجاد نمی‌کند و هیچ قراردادی از این نسخه دمو منعقد نمی‌شود. هر خدمت واقعی، به توافق جداگانه با کلینیک نیاز دارد.</p><ArrowLink href="/v3/tamas">رفتن به فرم تماس</ArrowLink></article></>
}

export function StandardPageView({ slug }: { slug: string }) {
  let content: ReactNode
  switch (slug) {
    case 'khadamat': content = <KhadamatPage />; break
    case 'nemune-karha': content = <NemuneKarhaPage />; break
    case 'darbare-ma': content = <DarbareMaPage />; break
    case 'tamas': content = <TamasPage />; break
    case 'ravesh': content = <RaveshPage />; break
    case 'takhasosha': content = <TakhasoshaPage />; break
    case 'navahi': content = <NavahiPage />; break
    case 'bayan': content = <BayanPage />; break
    default: content = <LegalPage slug={slug} />
  }
  return <main id="v3-main-content" className={`inner-page page-${slug}`}>{content}</main>
}

export function ProjectDetailView({ project }: { project: Project }) {
  const next = projects[(projects.findIndex(item => item.slug === project.slug) + 1) % projects.length]
  return <main id="v3-main-content" className="project-detail-page"><section className="project-detail-intro content-width"><Reveal><Link className="project-back text-link" href="/v3/nemune-karha">→ همه‌ی نمونه‌کارها</Link><p className="eyebrow">{project.category} — {project.year}</p><h1>{project.name}</h1><p className="project-detail-tagline">{project.description}</p></Reveal><Reveal className="project-service-list" delay={0.15}><p className="eyebrow">زیرمجموعه‌ی خدمات</p>{project.services.map(service => <span key={service}>{service}</span>)}</Reveal></section><div className="project-detail-hero" style={{ backgroundColor: project.color }}><MaskImage src={project.image} alt={`${project.name} — ارائه‌شده در کلینیک دکتر شبنم فضلی`} className="project-detail-photo" priority /></div><section className="project-story content-width"><Reveal><p className="eyebrow">درباره این خدمت</p><h2>چیزی مهم‌تر از نتیجه؛<br /><em>مسیر امن است.</em></h2></Reveal><Reveal><p>{project.detail}</p><p>هر مورد درمانی به‌صورت کامل طراحی می‌شود؛ با همان استاندارد دقت برای تصویر، تجربه و ایمنی.</p><ArrowLink href="/v3/tamas">مورد مشابه دارید؟ گفت‌وگو کنیم</ArrowLink></Reveal></section><section className="next-project"><Link href={`/v3/nemune/${next.slug}`}><div><p className="eyebrow">ادامه‌ی خدمات کلینیک</p><h2>{next.name}</h2></div><ArrowIcon diagonal /><img src={next.image} alt="" width="260" height="180" loading="lazy" /></Link></section></main>
}
