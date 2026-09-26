import type { Metadata } from 'next';
import Link from 'next/link';
import { MockShell } from '../components/MockShell';
import { mockRepository } from '../data';
import { sepidarFont } from '../fonts';

// The service listing — one of the mock "important routes". It reads everything
// through `mockRepository`, so replacing `data.ts` with Prisma is the whole
// migration.
export const metadata: Metadata = {
  title: { absolute: 'خدمات دندانپزشکی | کلینیک سپیدار' },
  description:
    'فهرست خدمات کلینیک دندانپزشکی سپیدار در تهران: ایمپلنت، ارتودنسی، طرح لبخند، درمان ریشه، دندانپزشکی کودکان و سفیدکردن دندان.',
  robots: { index: false, follow: false },
};

export default async function ServicesPage() {
  const [services, doctors, settings] = await Promise.all([
    mockRepository.listServices(),
    mockRepository.listDoctors(),
    mockRepository.getSettings(),
  ]);

  return (
    <div className={sepidarFont.variable}>
      <MockShell>
        <header className="v24-hero">
          <div className="v24-wrap v24-stack">
            <p className="v24-eyebrow">خدمات</p>
            <h1 className="h1">هر درمان، یک برنامه‌ی روشن</h1>
            <p className="v24-lead">
              در سپیدار پیش از هر اقدام، تشخیص و مسیر درمان را برای شما توضیح می‌دهیم؛ هزینه، تعداد
              جلسه‌ها و نتیجه‌ی مورد انتظار از ابتدا مشخص است.
            </p>
          </div>
        </header>

        <section className="v24-section-pad">
          <div className="v24-wrap">
            <div className="v24-grid">
              {services.map((service) => (
                <article key={service.slug} className="v24-card">
                  <Link href={`/v24/services/${service.slug}`} className="v24-card__link">
                    {/* plain <img>: these are already-mirrored assets at their
                        reference sizes, and the route deliberately depends on
                        no shared image configuration. */}
                    <img
                      className="v24-card__media"
                      src={service.image}
                      alt={service.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="v24-card__body">
                      <h2 className="v24-card__title">{service.name}</h2>
                      <p className="v24-card__summary">{service.summary}</p>
                      <div className="v24-card__meta">
                        <span>{service.duration}</span>
                        <span>{service.price}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="v24-section-pad">
          <div className="v24-wrap v24-stack">
            <p className="v24-eyebrow">تیم درمان</p>
            <h2 className="h3">متخصص‌هایی که پرونده‌ی شما را می‌شناسند</h2>
            <ul className="v24-list">
              {doctors.map((doctor) => (
                <li key={doctor.name}>
                  <b>{doctor.name}</b> — {doctor.role} ({doctor.focus})
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="v24-section-pad">
          <div className="v24-wrap v24-row">
            <a className="v24-btn" href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}>
              رزرو نوبت: {settings.phone}
            </a>
            <span className="v24-muted">{settings.hours}</span>
          </div>
        </section>
      </MockShell>
    </div>
  );
}
