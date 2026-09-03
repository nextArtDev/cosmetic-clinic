'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { motion } from 'framer-motion'

interface MobileLinks {
  href: string
  title: string
  className?: string
  toggle: () => void
}
const CustomMobileLink = ({
  href,
  title,
  className = '',
  toggle,
}: MobileLinks) => {
  const pathname = usePathname()
  const router = useRouter()
  const handleClick = () => {
    router.push(href)
    toggle()
  }
  return (
    <Link
      href={href}
      className={`${className} relative group text-xl text-black/70 font-bold  my-2`}
      onClick={handleClick}
    >
      {title}
      <span
        className={`h-[2px] inline-block gradient-base-r absolute right-0 -bottom-0.5
        group-hover:w-full transition-[width] ease duration-300 ${
          pathname === href ? 'w-full' : 'w-0'
        } `}
      >
        &nbsp;
      </span>
    </Link>
  )
}

interface MobileNavProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any
  onClose?: () => void
}

function MobileNav({ user, onClose }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <header className="relative w-full h-full mt-2 pr-1">
      <button
        ref={buttonRef}
        aria-label="منو"
        className="z-50 glass flex-col px-1.5 py-3 rounded-md justify-center items-center md:hidden  "
        onClick={() => {
          handleClick()
          onClose?.()
        }}
      >
        <span
          className={`bg-black/50 backdrop-blur-sm rounded-full block h-0.5 w-2 transition-all duration-300 ease-out  ${
            isOpen ? '!w-6 text rotate-45 translate-y-1' : '-translate-y-0.5'
          } `}
        ></span>
        <span
          className={`bg-black/50 backdrop-blur-sm block h-0.5 w-3 transition-all duration-300 ease-out rounded-full my-0.5 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          } `}
        ></span>
        <span
          className={`bg-black/50 backdrop-blur-sm block h-0.5 w-5 transition-all duration-300 ease-out rounded-full ${
            isOpen ? '!w-6 -rotate-45 -translate-y-1' : 'translate-y-0.5'
          }`}
        ></span>
      </button>

      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
          animate={{ scale: 1, opacity: 1 }}
          className="custom-box-shadow bg-white/30 backdrop-blur-sm overflow-hidden min-w-[75vw] z-30 flex flex-col justify-between items-center fixed max-w-sm:top-1/3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark/90 dark:bg-light/75 rounded-lg py-10"
        >
          <nav className="flex items-center flex-col justify-center text-black/50 font-bold ">
            <CustomMobileLink href="/v1" title="خانه" toggle={handleClick} />
            <CustomMobileLink
              href="/v1/faq"
              title="نظرات و سوالات"
              toggle={handleClick}
            />
            <CustomMobileLink
              href="/v1/specializations"
              title="تخصص‌ها"
              toggle={handleClick}
            />
            <CustomMobileLink
              href="/v1/doctors"
              title="دکترها"
              toggle={handleClick}
            />
            <CustomMobileLink
              href="/v1/about-us"
              title="درباره ما"
              toggle={handleClick}
            />
            <CustomMobileLink
              href="/v1/contact-us"
              title="تماس با ما"
              toggle={handleClick}
            />
            {!!user?.id ? (
              <CustomMobileLink
                href="/v1/user"
                title="پروفایل شخصی"
                toggle={handleClick}
              />
            ) : (
              <CustomMobileLink
                href="/v1/login"
                title="ورود/عضویت"
                toggle={handleClick}
              />
            )}
          </nav>
        </motion.div>
      )}
    </header>
  )
}

export default MobileNav
