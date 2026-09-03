'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, LogOut, Menu, UserRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut, useSession } from '@/lib/auth-client'

// --- Interfaces ---
interface NavbarProps {
  children: React.ReactNode
  className?: string
}
interface NavBodyProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}
interface NavItemsProps {
  items: { name: string; link: string }[]
  className?: string
  onItemClick?: () => void
  visible?: boolean // Added to receive scroll state
}
interface MobileNavProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}
interface MobileNavHeaderProps {
  children: React.ReactNode
  className?: string
}
interface MobileNavMenuProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}
interface NavbarButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: 'a' | 'button'
  variant?: 'primary' | 'secondary' | 'dark'
}

// Self-contained glass-pill styles for the navbar actions.
const NAVBAR_STYLES = `
.nav-glass-pill {
  --np-ink: var(--home-cream);
  --np-bg: var(--home-canvas);
  --np-gold: var(--home-gilded);
  background: linear-gradient(145deg,
    color-mix(in oklch, var(--np-ink) 6%, transparent) 0%,
    color-mix(in oklch, var(--np-gold) 4%, transparent) 100%);
  box-shadow:
    0 10px 30px -10px color-mix(in oklch, var(--np-bg) 50%, transparent),
    inset 0 1px 1px color-mix(in oklch, var(--np-ink) 10%, transparent),
    inset 0 -1px 2px color-mix(in oklch, var(--np-bg) 80%, transparent);
  border: 1px solid color-mix(in oklch, var(--np-ink) 10%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (hover: hover) {
  .nav-glass-pill:hover {
    background: linear-gradient(145deg,
      color-mix(in oklch, var(--np-ink) 10%, transparent) 0%,
      color-mix(in oklch, var(--np-gold) 7%, transparent) 100%);
    border-color: color-mix(in oklch, var(--np-gold) 35%, transparent);
    box-shadow:
      0 20px 40px -10px color-mix(in oklch, var(--np-bg) 70%, transparent),
      inset 0 1px 1px color-mix(in oklch, var(--np-ink) 20%, transparent);
  }
}
`

// --- Main Wrapper ---
export const Navbar = ({ children, className }: NavbarProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      aria-label="منوی اصلی"
      className={cn('fixed inset-x-0 top-0 w-full z-50 ', className)}
    >
      <style dangerouslySetInnerHTML={{ __html: NAVBAR_STYLES }} />
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </nav>
  )
}

// --- Desktop Body ---
export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        width: visible ? '90%' : '100%',
        maxWidth: visible ? '1100px' : '100%',
        borderRadius: visible ? '9999px' : '16px',
        y: visible ? 16 : 0,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className={cn(
        ' relative z-90 mx-auto hidden flex-row items-center justify-between self-start px-6 py-2.5 lg:flex',
        className,
      )}
    >
      {/* Glass scrim — fades in only after scrolling to provide contrast */}
      <motion.div
        aria-hidden
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 -z-10 rounded-[inherit] bg-canvas/90 backdrop-blur-md"
      />
      <motion.div
        aria-hidden
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 -z-10 rounded-[inherit] border border-gilded/20 bg-canvas/55 shadow-[0_8px_32px_0_rgba(0,0,0,0.35)]"
      />

      {/* Pass the 'visible' state down to children so links can adapt colors */}
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  )
}

// --- Desktop Nav Items ---
export const NavItems = ({
  items,
  className,
  onItemClick,
  visible,
}: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const pathname = usePathname()

  return (
    <div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'hidden flex-1 flex-row items-center justify-start gap-1 text-sm font-medium lg:flex',
        className,
      )}
    >
      {items.map((item, idx) => {
        const isActive =
          pathname === item.link ||
          (item.link !== '/' && pathname.startsWith(item.link))
        const isHighlighted = hovered === idx || isActive

        return (
          <Link
            onMouseEnter={() => setHovered(idx)}
            onClick={onItemClick}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'pointer-events-auto relative whitespace-nowrap rounded-full px-4 py-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gilded/60',
              // Dynamic text colors: Dark text when transparent (before scroll),
              // Light text when glass scrim is active (after scroll).
              isActive
                ? visible
                  ? 'text-cream'
                  : 'text-canvas-deep'
                : visible
                  ? 'text-cream hover:text-gild-bright'
                  : 'text-canvas-deep hover:text-gilded',
            )}
            key={`link-${idx}`}
            href={item.link}
          >
            {isHighlighted && (
              <motion.div
                layoutId="hovered"
                className={cn(
                  'absolute inset-0 h-full w-full rounded-full',
                  isActive
                    ? 'bg-gilded/20'
                    : visible
                      ? 'bg-cream/10'
                      : 'bg-canvas-deep/10', // Darker subtle hover pill before scroll
                )}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20 flex items-center gap-2">
              {isActive && (
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-gilded shadow-[0_0_8px_var(--home-gilded)]"
                />
              )}
              {item.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

// --- Mobile Nav ---
export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        width: visible ? '95%' : '100%',
        borderRadius: visible ? '24px' : '0px',
        y: visible ? 12 : 0,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className={cn(
        // Removed background completely for a 100% transparent mobile header
        'relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between px-0 py-2 lg:hidden',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => (
  <div
    className={cn(
      'flex w-full flex-row items-center justify-between px-4',
      className,
    )}
  >
    {children}
  </div>
)

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute left-0 right-0 top-full mt-1 z-50 flex w-full flex-col items-start justify-start gap-1 rounded-2xl border border-gilded/20 bg-canvas/95 px-5 py-6 shadow-xl backdrop-blur-md',
            className,
          )}
          id="mobile-nav-menu"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    aria-expanded={isOpen}
    aria-controls="mobile-nav-menu"
    aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
    className="nav-glass-pill flex h-9 w-9 items-center justify-center rounded-full text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gilded/60"
  >
    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
  </button>
)

// --- Mobile User Slot ---
export const MobileUserMenu = () => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const user = session?.user

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    router.refresh()
  }

  if (isPending) {
    return (
      <span
        aria-hidden
        className="nav-glass-pill flex h-9 w-9 items-center justify-center rounded-full text-cream/40"
      >
        <UserRound className="h-5 w-5" />
      </span>
    )
  }

  if (!user) {
    return (
      <Link
        href="/signin"
        className="flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-gild-bright via-gilded to-gild-deep px-4 text-sm font-bold text-canvas-deep shadow-md shadow-gilded/25 transition-all duration-300 active:scale-[0.98]"
      >
        ورود
      </Link>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="منوی حساب کاربری"
        className="nav-glass-pill flex h-9 w-9 items-center justify-center rounded-full text-cream"
      >
        <UserRound className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            role="menu"
            className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gilded/20 bg-canvas/95 shadow-2xl backdrop-blur-md"
          >
            <div className="border-b border-cream/10 px-4 py-3">
              <p className="truncate text-sm font-bold text-cream">
                {user.name || 'حساب کاربری'}
              </p>
              {(user.phoneNumber || user.email) && (
                <p dir="ltr" className="truncate text-xs text-cream-dim">
                  {user.phoneNumber || user.email}
                </p>
              )}
            </div>
            <div className="p-1.5">
              <Link
                href="/user"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-cream/10 hover:text-gild-bright"
              >
                <CalendarCheck className="h-4 w-4 shrink-0 text-gilded" />
                ویزیت‌های من
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-cream-dim transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                خروج از حساب
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Desktop Glass Action Pills ---
export const NavbarBookingPill = () => (
  <Link
    href="/booking"
    className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-gild-bright via-gilded to-gild-deep px-5 py-2.5 text-sm font-bold text-canvas-deep shadow-md shadow-gilded/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-gilded/40 active:scale-[0.98]"
  >
    <CalendarCheck className="h-4 w-4 shrink-0 text-canvas-deep/70 transition-colors group-hover:text-canvas-deep" />
    رزرو نوبت آنلاین
  </Link>
)

export const NavbarVisitsPill = () => (
  <Link
    href="/user"
    className="nav-glass-pill flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-bold text-cream group"
  >
    <UserRound className="h-4 w-4 shrink-0 text-gild-bright transition-colors group-hover:text-gilded" />
    ویزیت‌های من
  </Link>
)

// --- Button ---
export const NavbarButton = ({
  href,
  as: Tag = 'a',
  children,
  className,
  variant = 'primary',
  ...props
}: NavbarButtonProps) => {
  const baseStyles =
    'px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gilded/60'
  const variantStyles: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-gild-bright via-gilded to-gild-deep text-canvas-deep font-bold shadow-md shadow-gilded/25 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'border border-cream/15 bg-cream/5 text-cream hover:bg-cream/10',
    dark: 'bg-canvas-raised text-cream hover:brightness-110 shadow-sm',
  }

  const RenderTag = (href
    ? Link
    : Tag) as unknown as React.FC<NavbarButtonProps>

  return (
    <RenderTag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </RenderTag>
  )
}
