import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileLinks {
  href: string
  title: string
  className?: string
}
const CustomMobileLink = ({ href, title, className = '' }: MobileLinks) => {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={`${className}  relative group text-lg text-black/50 font-bold my-2`}
    >
      {title}
      <span
        className={`h-[3px] inline-block glass absolute right-0 -bottom-0.5
        group-hover:w-full transition-[width] ease duration-300 ${
          pathname === href ? 'w-full' : 'w-0'
        } `}
      >
        &nbsp;
      </span>
    </Link>
  )
}
const SimpleDesktopMenu = () => {
  return (
    <div>
      <article className="self-start flex w-full max-w-lg items-center justify-evenly">
        <CustomMobileLink title="تخصص‌ها" className="" href={'/v1/specializations'} />

        <CustomMobileLink title="دکترها" className="" href={'/v1/doctors'} />
        <CustomMobileLink title="نظرات و سوالات" className="" href={'/v1/faq'} />
        <CustomMobileLink title="درباره ما" className="" href={'/v1/about-us'} />
        <CustomMobileLink
          title="ارتباط با ما"
          className=""
          href={'/v1/contact-us'}
        />
      </article>
    </div>
  )
}

export default SimpleDesktopMenu
