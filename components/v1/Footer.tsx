import Link from 'next/link'
import { ForwardIcon, MapPin, Phone } from 'lucide-react'
import { getV1HomeData } from '@/lib/v1/data'

export async function Footer() {
  const data = await getV1HomeData()
  const { specializations, doctors, illnesses } = data

  const doctorLinks =
    doctors
      .slice(0, 5)
      .map((d) => ({ title: d.name, url: `/v1/doctors/${d.slug}` })) || []
  const specLinks =
    specializations
      .slice(0, 5)
      .map((s) => ({ title: s.name, url: `/v1/specializations/${s.slug}` })) ||
    []
  const illnessLinks =
    illnesses
      .slice(0, 5)
      .map((i) => ({ title: i.name, url: `/v1/illnesses/${i.slug}` })) || []

  const columns = [
    {
      title: 'پزشکان',
      links: [...doctorLinks, { title: 'همه پزشکان', url: '/v1/doctors' }],
    },
    {
      title: 'تخصص‌ها',
      links: [
        ...specLinks,
        { title: 'همه تخصص‌ها', url: '/v1/specializations' },
      ],
    },
    {
      title: 'بیماری‌ها',
      links: [
        ...illnessLinks,
        { title: 'همه بیماری‌ها', url: '/v1/illnesses' },
      ],
    },
  ]

  return (
    <section className="v1-grainy flex w-full flex-col items-center justify-start gap-16 px-8 py-16 text-black shadow-2xl">
      <div className="flex w-full max-w-7xl flex-col gap-10 text-xs md:text-sm lg:text-base">
        <div className="flex flex-col gap-5">
          <p className="v1-title-gradient-sage text-start text-xl md:text-3xl">
            مجتمع پزشکی کوثر
          </p>
          <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-8">
            <p className="flex items-center gap-1.5 font-semibold text-black/70">
              <MapPin size={16} className="text-teal-700" />
              مسجدسلیمان، خیابان آزادی، جنب سازمان تبلیغات
            </p>
            <a
              href="tel:06143228700"
              className="flex items-center gap-1.5 font-semibold text-black/70 hover:text-teal-700"
            >
              <Phone size={16} className="text-teal-700" />
              ۰۶۱-۴۳۲۲۸۷۰۰
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <h3 className="v1-title-gradient-sage text-lg">{col.title}</h3>
              <ul className="flex flex-col gap-1.5 font-normal text-black/70">
                {col.links.map((link) => (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      className="inline-flex items-center gap-1 hover:text-teal-800"
                    >
                      <ForwardIcon className="h-4 w-4 -scale-x-100" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-7xl rounded-t-lg bg-secondary/40 px-4 py-3 text-center text-xs text-black/50 backdrop-blur-md md:text-sm">
        کلیه حقوق مادی و معنوی این وب‌سایت برای مجتمع پزشکی کوثر محفوظ است. ©{' '}
        {new Date().getFullYear()}
      </div>
    </section>
  )
}
