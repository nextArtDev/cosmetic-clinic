'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  // NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  MobileUserMenu,
  NavbarBookingPill,
  NavbarVisitsPill,
} from './Navbar'

export function AppNavbar() {
  // Anchors point to sections of the landing page; the rest are real routes.
  const navItems = [
    { name: 'خانه', link: '/' },
    { name: 'نتایج', link: '/#results' },
    { name: 'نظرات مراجعین', link: '/#testimonials' },
    { name: 'سوالات', link: '/faq' },
  ]

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Navbar className="  z-100">
      {/* Desktop Navigation */}
      <NavBody className="bg-transparent!important">
        {/* <NavbarLogo /> */}
        <NavItems items={navItems} />
        <div className="relative z-20 flex items-center gap-3">
          <NavbarVisitsPill />
          <NavbarBookingPill />
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          {/* RTL page: the hamburger sits at the inline-start (right) edge,
              the user slot at the far end (left), the logo centered between
              them. */}
          <div className="flex flex-1 justify-start">
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
          {/* <NavbarLogo /> */}
          <div className="flex flex-1 justify-end">
            <MobileUserMenu />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => {
            const isActive =
              pathname === item.link ||
              (item.link !== '/' && pathname.startsWith(item.link))
            return (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gilded/60',
                  isActive
                    ? 'bg-gilded/15 text-cream'
                    : 'text-cream-dim hover:bg-cream/5 hover:text-gild-bright',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full bg-gilded transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {item.name}
              </Link>
            )
          })}
          <div className="mt-4 flex w-full flex-col gap-3 border-t border-gilded/15 pt-5">
            <NavbarButton
              href="/user"
              variant="secondary"
              className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ویزیت‌های من
            </NavbarButton>
            <NavbarButton
              href="/booking"
              variant="primary"
              className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              رزرو نوبت آنلاین
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}
