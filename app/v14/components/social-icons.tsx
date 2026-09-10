'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { InstagramIcon, LinkedInIcon, TelegramIcon, YouTubeIcon } from './icons'
import { LINKS } from '../lib/assets'

const ITEMS = [
  { href: LINKS.instagram, label: 'اینستاگرام', Icon: InstagramIcon },
  { href: LINKS.telegram, label: 'تلگرام', Icon: TelegramIcon },
  { href: LINKS.youtube, label: 'یوتیوب', Icon: YouTubeIcon },
  { href: LINKS.linkedin, label: 'لینکدین', Icon: LinkedInIcon },
]

export default function SocialIcons() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const icons = el.querySelectorAll('.icon-1x1-small')
    const tween = gsap.fromTo(
      icons,
      { opacity: 0 },
      { opacity: 1, duration: 2, ease: 'none', stagger: 0.1, delay: 1 },
    )
    return () => {
      tween.kill()
    }
  }, [])

  return (
    <div className="social-icons-wrapper" ref={ref}>
      {ITEMS.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="side-link"
          aria-label={label}
        >
          <div className="icon-1x1-small" data-social-icon>
            <Icon />
          </div>
        </a>
      ))}
    </div>
  )
}
