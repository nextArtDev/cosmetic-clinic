'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Instagram, Telegram, Whatsapp } from './Icons'
import { site } from '../lib/data'

const GROUPS = [
  {
    category: 'کاوش',
    links: [
      { label: 'خدمات', href: '/v6/#treatments' },
      { label: 'دکترها', href: '/v6/#my-pick' },
      { label: 'نظر بیماران', href: '/v6/#reviews' },
      { label: 'کلینیک', href: '/v6/#store' },
      { label: 'کارتی هدیه', href: '/v6/#gift-cards' },
    ],
  },
  {
    category: 'درباره',
    links: [
      { label: 'دکتر فرهادی', href: '/v6/#doctors' },
      { label: 'دکتر موسوی', href: '/v6/#doctors' },
      { label: 'آدرس کلینیک', href: '/v6/#visit' },
    ],
  },
  {
    category: 'در تماس',
    links: [
      { label: 'ثبت درخواست', href: '/v6/#enquire' },
      { label: 'رزرو نوبت', href: '/v6/#book' },
    ],
  },
]

const SOCIALS = [
  { label: 'اینستاگرام', href: 'https://instagram.com', Icon: Instagram },
  { label: 'تلگرام', href: 'https://t.me', Icon: Telegram },
  { label: 'واتساپ', href: 'https://wa.me/989123456789', Icon: Whatsapp },
]

export default function MenuOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {/* backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[54] bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div className={`menu-panel ${open ? 'open' : ''}`} inert={!open}>
        <div className="container-wondr flex min-h-full flex-col pb-[4rem] pt-[14rem]">
          <div className="grid grid-cols-1 gap-x-[4rem] gap-y-[4.8rem] lg:grid-cols-12">
            {GROUPS.map((group, gi) => (
              <div
                key={group.category}
                className={gi === 0 ? 'lg:col-span-5' : gi === 1 ? 'lg:col-span-4' : 'lg:col-span-3'}
              >
                <motion.span
                  className="eyebrow-wide block text-grey"
                  initial={{ opacity: 0, y: 20 }}
                  animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.7,
                    delay: open ? 0.45 + gi * 0.06 : 0,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                >
                  {group.category}
                </motion.span>

                <nav className="mt-[2.4rem]">
                  {group.links.map((link, li) => (
                    <div key={link.label} className="overflow-hidden py-[0.4rem]">
                      <motion.div
                        initial={{ y: '110%' }}
                        animate={open ? { y: '0%' } : { y: '110%' }}
                        transition={{
                          duration: 0.8,
                          delay: open ? 0.5 + gi * 0.07 + li * 0.055 : 0,
                          ease: [0.76, 0, 0.24, 1],
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={onClose}
                          data-cursor="cta"
                          className="menu-link"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    </div>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <motion.div
            className="mt-auto flex flex-wrap items-end justify-between gap-[2.4rem] pt-[8rem]"
            initial={{ opacity: 0 }}
            animate={open ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: open ? 0.9 : 0, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center gap-[2rem]">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  data-cursor="cta"
                  className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-full border border-ink/15 text-ink transition-all duration-500 hover:border-pink hover:bg-pink hover:text-ink"
                >
                  <Icon className="h-[1.8rem] w-[1.8rem]" />
                </a>
              ))}
            </div>
            <p className="body-sm max-w-[36rem] text-ink/60">
              {site.address} · شنبه تا چهارشنبه ۹:۰۰–۱۹:۰۰ · پنجشنبه ۹:۰۰–۱۴:۰۰
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
