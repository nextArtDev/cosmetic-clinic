import Link from 'next/link'

import { cn } from '@/lib/utils'
import type { V1Doctor, V1Illness, V1Specialization } from '@/lib/v1/data'
import { ForwardIcon } from 'lucide-react'
import Image from 'next/image'
import Location from './location'
import { shuffleArray } from '@/lib/utils'

type FooterProps = {
  specializations?: V1Specialization[]
  doctors?: V1Doctor[]
  illnesses?: V1Illness[]
}
const Footer = ({ specializations, doctors, illnesses }: FooterProps) => {
  const limitedDoctors =
    doctors?.slice(0, 5).map((doctor) => {
      return { title: doctor.name, url: `/v1/doctors/${doctor.slug}` }
    }) || []
  const limitedSpecializations =
    specializations?.slice(0, 5).map((specialization) => {
      return {
        title: specialization.name,
        url: `/v1/specializations/${specialization.slug}`,
      }
    }) || []

  const randomIllness = () => {
    if (!illnesses || illnesses.length === 0) return []

    const shuffledIllnesses = shuffleArray([...(illnesses || [])])
    return (
      shuffledIllnesses
        .slice(0, 5)
        .map((illness) => ({
          title: illness.name,
          url: `/v1/illnesses/${illness.slug}`,
        }))
    )
  }
  const limitedIllnesses = randomIllness() || []

  const footerLinks = [
    {
      title: 'دکترها',
      links: [...limitedDoctors, { title: 'همه دکترها', url: '/v1/doctors' }],
    },
    {
      title: 'تخصص‌ها',
      links: [
        ...limitedSpecializations,
        { title: 'همه تخصص‌ها', url: '/v1/specializations' },
      ],
    },
    {
      title: 'بیماری‌ها',
      links: [
        ...limitedIllnesses,
        { title: 'همه بیماری‌ها', url: '/v1/illnesses' },
      ],
    },
  ]
  return (
    <section className="  text-black px-8 flex items-center justify-start flex-col paddings w-full gap-20  shadow-2xl ">
      <div className="flex flex-col gap-8 w-full text-xs md:text-sm lg:text-base ">
        <div className="flex items-start flex-col gap-4 ">
          <p className="font-bold ix-blend-multiply text-blue-600 text-start text-lg md:text-xl lg:text-3xl mt-5 max-w-xs">
            مجتمع پزشکی کوثر{' '}
          </p>
          <div className="flex flex-col items-center justify-between md:justify-around">
            <p className="mix-blend-multiply font-semibold text-start text-xs md:text-base max-w-md">
              مسجدسلیمان، خیابان آزادی، جنب سازمان تبلیغات
              <br />
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-12">
          {footerLinks?.[0].links.length > 0 && (
            <FooterColumn
              title={footerLinks[0].title}
              links={footerLinks[0].links}
            />
          )}

          <div className="flex-1 flex flex-col gap-4 flex-wrap  ">
            {footerLinks?.[1].links.length > 0 && (
              <FooterColumn
                title={footerLinks[1].title}
                links={footerLinks[1].links}
              />
            )}
          </div>
          <div className="flex-1 justify-between items-center">
            <div className=" flex flex-col gap-4 flex-wrap ">
              {footerLinks?.[2].links.length > 0 && (
                <FooterColumn
                  title={footerLinks[2].title}
                  links={footerLinks[2].links}
                />
              )}
            </div>
          </div>
        </div>
        <Location />
        <span className="!w-full bg-secondary/40 backdrop-blur-md rounded-t-lg flex flex-wrap items-center justify-center font-semibold gap-1 text-center text-black/40 text-xm lg:text-base py-2 md:py-6 ">
          کلیه حقوق مادی و معنوی این وب سایت برای
          <Link
            href="https://telegram.me/+989352310831"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex gap-1 underline "
          >
            <span> سعید مهمان‌پرست </span>
            <Image
              width={24}
              height={24}
              src={'/v1/icons/telegram.svg'}
              alt="Saeid Mehmanparst"
            />
          </Link>
          محفوظ می باشد.
        </span>
      </div>
    </section>
  )
}
export default Footer

type ColumnProps = {
  title: string
  links: Array<{ title?: string; url: string }>
}

const FooterColumn = ({ title, links }: ColumnProps) => (
  <div className="flex-1 flex flex-col gap-2 md:text-sm text-xm min-w-max">
    <h3 className="font-bold text-lg md:text-xl mix-blend-multiply text-blue-400 ">
      {title}
    </h3>
    <ul className="flex flex-col gap-1 font-normal  ">
      {links?.map((link, index) => (
        <Link
          href={link.url}
          key={link.title}
          className={cn(
            'hover:text-gray-600 ',
            index === links.length - 1
              ? 'opacity-70 text-muted pt-2 underline underline-primary  underline-offset-4 font-semibold flex gap-0.5 items-center  '
              : '',
          )}
        >
          {index === links.length - 1 && (
            <ForwardIcon
              className="rotate-270 h-6 w-4 flex-none"
              aria-hidden="true"
            />
          )}
          {link.title}
        </Link>
      ))}
    </ul>
  </div>
)
