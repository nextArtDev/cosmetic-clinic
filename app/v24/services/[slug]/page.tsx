import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MockShell } from '../../components/MockShell';
import { mockRepository } from '../../data';
import { sepidarFont } from '../../fonts';

// The service detail — the mock "product page". Its slugs come from the
// repository, so adding a service to `data.ts` (or to the future Prisma table)
// adds a route with no other change.

// Every slug is known at build time from the mock repository; a request for
// anything else is a 404 rather than a server-rendered miss.
export const dynamicParams = false;

export async function generateStaticParams() {
  const services = await mockRepository.listServices();
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await mockRepository.getService(slug);
  return {
    title: {
      absolute: service ? `${service.name} | کلینیک دندانپزشکی سپیدار` : 'خدمت پیدا نشد | سپیدار',
    },
    description: service?.summary,
    robots: { index: false, follow: false },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, services, settings] = await Promise.all([
    mockRepository.getService(slug),
    mockRepository.listServices(),
    mockRepository.getSettings(),
  ]);

  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <div className={sepidarFont.variable}>
      <MockShell>
        <header className="v24-hero">
          <div className="v24-wrap v24-stack">
            <p className="v24-eyebrow">
              <Link href="/v24/services" className="v24-bar__link">
                خدمات
              </Link>
              <span aria-hidden="true"> / </span>
              {service.name}
            </p>
            <h1 className="h1">{service.name}</h1>
            <p className="v24-lead">{service.summary}</p>
          </div>
        </header>

        <section className="v24-section-pad">
          <div className="v24-wrap v24-detail">
            <div className="v24-stack">
              <img className="v24-figure" src={service.image} alt={service.name} decoding="async" />
              <div className="v24-prose">
                <p>{service.intro}</p>
              </div>
            </div>

            <aside className="v24-aside">
              <div className="v24-row">
                <span className="v24-chip">
                  مدت درمان: <b>{service.duration}</b>
                </span>
                <span className="v24-chip">
                  هزینه: <b>{service.price}</b>
                </span>
              </div>

              <div className="v24-stack">
                <h2 className="h5">این خدمت شامل چه چیزهایی است؟</h2>
                <ul className="v24-list">
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <a className="v24-btn" href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}>
                رزرو نوبت مشاوره
              </a>
              <p className="v24-muted">
                {settings.hours} — {settings.address}
              </p>
            </aside>
          </div>
        </section>

        <section className="v24-section-pad">
          <div className="v24-wrap v24-stack">
            <p className="v24-eyebrow">خدمات مرتبط</p>
            <div className="v24-grid">
              {others.map((other) => (
                <article key={other.slug} className="v24-card">
                  <Link href={`/v24/services/${other.slug}`} className="v24-card__link">
                    <img
                      className="v24-card__media"
                      src={other.image}
                      alt={other.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="v24-card__body">
                      <h2 className="v24-card__title">{other.name}</h2>
                      <p className="v24-card__summary">{other.summary}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </MockShell>
    </div>
  );
}
