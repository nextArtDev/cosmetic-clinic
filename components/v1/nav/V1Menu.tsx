'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/v1', label: 'خانه', exact: true },
  { href: '/v1/doctors', label: 'پزشکان' },
  { href: '/v1/specializations', label: 'تخصص‌ها' },
  { href: '/v1/illnesses', label: 'بیماری‌ها' },
  { href: '/v1/booking', label: 'رزرو نوبت' },
]

export default function V1Menu() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6 text-sm font-semibold text-black/70">
      {links.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'relative rounded-full px-3 py-1.5 transition-colors hover:text-teal-900',
              active && 'v1-glass text-teal-900 shadow-sm',
            )}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
