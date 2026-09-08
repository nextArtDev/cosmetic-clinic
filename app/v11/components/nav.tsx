/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV_LINKS, BOOK_LINK } from '../lib/content'
import { ScrollTrigger } from '../lib/gsap'

const EASE = [0.76, 0, 0.24, 1] as const

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className="scmd:flex scmd:items-baseline"
      style={{ color: dark ? 'var(--black)' : '#fff', lineHeight: 1 }}
    >
      <span
        className="scmd:block"
        style={{
          fontFamily: 'var(--scmd-font-sans)',
          fontWeight: 700,
          fontSize: '1.55em',
        }}
      >
        مدنما
      </span>
      <span style={{ color: 'var(--pink)', fontSize: '1.55em', fontFamily: 'var(--scmd-font-sans)' }}>
        .
      </span>
    </span>
  )
}

function SlideLink({
  label,
  href,
  dark,
  onClick,
}: {
  label: string
  href: string
  dark?: boolean
  onClick?: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`slide-link ${dark ? '' : 'light'}`}
    >
      <span>{label}</span>
      <span aria-hidden>{label}</span>
    </a>
  )
}

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(0)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '#practice',
      start: 'top 4em',
      onEnter: () => setSolid(true),
      onLeaveBack: () => setSolid(false),
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className="scmd:fixed scmd:inset-x-0 scmd:top-0 scmd:z-50 scmd:transition-colors scmd:duration-500"
        style={{
          backgroundColor: solid ? 'rgba(248,247,242,0.82)' : 'transparent',
          backdropFilter: solid ? 'blur(14px)' : 'none',
        }}
      >
        <div className="container scmd:relative">
          <div
            className="scmd:relative scmd:grid scmd:items-center"
            style={{
              gridTemplateColumns: '1fr 2fr 1fr',
              height: '4em',
              paddingLeft: '0.25em',
              paddingRight: '0.25em',
            }}
          >
            <a
              href="#top"
              className="scmd:flex scmd:items-center"
              style={{ paddingRight: '1.63em' }}
              aria-label="مدنما — صفحهٔ اصلی"
            >
              <Logo dark={solid} />
            </a>

            <nav className="scmd:hidden scmd:md:flex scmd:items-center scmd:justify-center" style={{ gap: '1.5em' }}>
              {NAV_LINKS.map((l) => (
                <SlideLink key={l.href} label={l.label} href={l.href} dark={solid} />
              ))}
            </nav>

            <div className="scmd:flex scmd:items-center scmd:justify-end">
              <a
                href={BOOK_LINK}
                className="scmd:hidden scmd:md:flex scmd:items-center scmd:justify-center scmd:transition-colors scmd:duration-300"
                style={{
                  width: '4em',
                  height: '4em',
                  color: solid ? 'var(--black)' : '#fff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--pink)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = solid ? 'var(--black)' : '#fff'
                }}
                aria-label="رزرو دمو"
              >
                <svg
                  width="1.44em"
                  height="1.44em"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.418 3.582-7 8-7s8 2.582 8 7" />
                </svg>
              </a>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="scmd:relative scmd:flex scmd:items-center scmd:justify-center scmd:md:hidden"
                style={{
                  width: '4.5em',
                  height: '4.5em',
                  color: solid && !open ? 'var(--black)' : '#fff',
                }}
                aria-label={open ? 'بستن منو' : 'بازکردن منو'}
              >
                <span className="scmd:relative scmd:block" style={{ width: '2em', height: '0.9em' }}>
                  <motion.span
                    className="scmd:absolute scmd:left-0 scmd:block scmd:h-px scmd:w-full"
                    style={{ background: 'currentColor' }}
                    animate={open ? { top: '0.45em', rotate: 45 } : { top: 0, rotate: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                  <motion.span
                    className="scmd:absolute scmd:left-0 scmd:block scmd:h-px scmd:w-full"
                    style={{ background: 'currentColor' }}
                    animate={
                      open ? { bottom: '0.45em', rotate: -45 } : { bottom: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </span>
              </button>
            </div>

            <div className="scmd:pointer-events-none scmd:absolute scmd:inset-x-0 scmd:bottom-0">
              <span
                className="line-horizontal"
                style={{
                  backgroundColor: solid
                    ? 'rgba(205,160,127,0.5)'
                    : 'rgba(255,255,255,0.5)',
                }}
              />
              {!solid && (
                <>
                  <img
                    src="/v11/img/decor/decor-1.svg"
                    alt=""
                    className="scmd:absolute"
                    style={{ width: '0.88em', height: '0.88em', right: '-0.4em', bottom: '-0.4em' }}
                  />
                  <img
                    src="/v11/img/decor/decor-2.svg"
                    alt=""
                    className="scmd:absolute"
                    style={{ width: '0.88em', height: '0.88em', left: '3.55em', bottom: '-0.4em' }}
                  />
                  <img
                    src="/v11/img/decor/decor-3.svg"
                    alt=""
                    className="scmd:absolute"
                    style={{ width: '0.88em', height: '0.88em', left: '-0.4em', bottom: '-0.4em' }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="scmd:fixed scmd:inset-0 scmd:z-40 scmd:md:hidden"
            style={{ backgroundColor: '#272526' }}
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div
              className="scmd:flex scmd:h-full scmd:flex-col scmd:items-start scmd:justify-center"
              style={{ padding: '0 1.88em' }}
            >
              <div className="scmd:relative scmd:flex scmd:w-full scmd:flex-col scmd:items-start scmd:justify-between" style={{ gap: '1.5em' }}>
                <div className="scmd:flex scmd:flex-col" style={{ gap: '0.4em' }}>
                  {NAV_LINKS.map((l, idx) => (
                    <motion.a
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setHovered(idx)}
                      className="text-65-regular"
                      style={{
                        color: hovered === idx ? '#f8f7f2' : 'rgba(248,247,242,0.45)',
                      }}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 + idx * 0.07, duration: 0.6, ease: EASE }}
                    >
                      {l.label}
                    </motion.a>
                  ))}
                </div>

                <div
                  className="scmd:relative scmd:overflow-hidden"
                  style={{
                    width: '9em',
                    height: '9em',
                    borderRadius: '0.31em',
                    alignSelf: 'flex-end',
                  }}
                >
                  {NAV_LINKS.map((l, idx) => (
                    <motion.img
                      key={l.href}
                      src={l.img}
                      alt=""
                      className="scmd:absolute scmd:inset-0 scmd:h-full scmd:w-full"
                      style={{ objectFit: 'cover' }}
                      initial={false}
                      animate={{
                        opacity: hovered === idx ? 1 : 0,
                        scale: hovered === idx ? 1 : 1.08,
                      }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  ))}
                </div>
              </div>

              <motion.a
                href={BOOK_LINK}
                onClick={() => setOpen(false)}
                className="btn-black"
                style={{ marginTop: '2.5em' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                رزرو دمو
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
