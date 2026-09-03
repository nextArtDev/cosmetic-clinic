'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, ArrowUpRight, UserRound, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { signOut, useSession } from '@/lib/auth-client'

const links = [
  { href: '/v1/doctors', label: 'پزشکان' },
  { href: '/v1/specializations', label: 'تخصص‌ها' },
  { href: '/v1/illnesses', label: 'بیماری‌ها' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSignOut() {
    await signOut()
    router.refresh()
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'py-3' : 'py-6',
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div
          className={cn(
            'flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500',
            scrolled
              ? 'glass-panel'
              : 'bg-transparent border border-transparent',
          )}
        >
          <Link
            href="/v1"
            className="flex items-center gap-2 font-display text-lg tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sage-bright to-sage text-ivory text-sm">
              ۴۰۴
            </span>
            کلینیک ۴۰۴
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-ivory-dim">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-ivory transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/v1/user">
                    <UserRound size={15} />
                    {user.name ?? 'حساب کاربری'}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={handleSignOut}
                  className="gap-2 text-ivory-dim hover:text-red-300"
                >
                  <LogOut size={14} /> خروج
                </Button>
              </>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/v1/signin">ورود</Link>
              </Button>
            )}
            <Button asChild size="sm">
              <Link href="/v1/booking" className="flex items-center gap-1.5">
                رزرو نوبت <ArrowUpRight size={14} />
              </Link>
            </Button>
          </div>

          <button
            className="md:hidden text-ivory"
            onClick={() => setOpen((v) => !v)}
            aria-label="منو"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel mt-2 flex flex-col gap-4 p-6 md:hidden"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-ivory text-lg"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button asChild variant="ghost" className="flex-1">
                    <Link href="/v1/user" onClick={() => setOpen(false)}>
                      حساب کاربری
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    className="flex-1 text-red-300"
                    onClick={handleSignOut}
                  >
                    خروج
                  </Button>
                </>
              ) : (
                <Button asChild variant="ghost" className="flex-1">
                  <Link href="/v1/signin" onClick={() => setOpen(false)}>
                    ورود
                  </Link>
                </Button>
              )}
              <Button asChild className="flex-1">
                <Link href="/v1/booking" onClick={() => setOpen(false)}>
                  رزرو نوبت
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}
