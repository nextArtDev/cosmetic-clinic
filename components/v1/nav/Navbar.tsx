'use client'

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import GlobalSearch from '@/components/v1/search/GlobalSearch'
import { cn } from '@/lib/utils'
import { HomeIcon, User2Icon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import MobileNav from './MobileNav'
import SimpleDesktopMenu from './SimpleDesktopMenu'

const clamp = (number: number, min: number, max: number) =>
  Math.min(Math.max(number, min), max)

function useBoundedScroll(bounds: number) {
  const { scrollY } = useScroll()
  const scrollYBounded = useMotionValue(0)
  const scrollYBoundedProgress = useTransform(
    scrollYBounded,
    [0, bounds],
    [0, 1],
  )

  useEffect(() => {
    return scrollY.onChange((current) => {
      const previous = scrollY.getPrevious() || 0
      const diff = current - previous
      const newScrollYBounded = scrollYBounded.get() + diff

      scrollYBounded.set(clamp(newScrollYBounded, 0, bounds))
    })
  }, [bounds, scrollY, scrollYBounded])

  return { scrollYBounded, scrollYBoundedProgress }
}

interface NavbarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any
}

const Navbar = ({ user }: NavbarProps) => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  })

  const path = usePathname()
  const isMainNav = path === '/v1' || path === '/v1/'
  const { scrollYBoundedProgress } = useBoundedScroll(400)
  const scrollYBoundedProgressThrottled = useTransform(
    scrollYBoundedProgress,
    [0, 0.85, 1],
    [0, 0, 1],
  )
  return (
    <section className="  relative  mx-auto flex w-full max-w-3xl flex-1 overflow-hidden">
      {user && (user.role === 'ADMIN' || user.role === 'admin') && (
        <Link
          className="fixed border animate-pulse  z-50 bg-primary bottom-8 left-2 w-fit h-auto px-2 py-1 rounded-md text-primary-foreground "
          href={'/dashboard'}
        >
          داشبورد
        </Link>
      )}
      <article className=" z-50 fixed top-0 lg:top-0   max-w-full px-4 py-8 font-semibold  w-full h-12 bg-transparent grid place-content-center grid-cols-6 md:hidden ">
        <div className="col-span-1 ">
          <MobileNav user={user} />
        </div>
        <div className="col-span-4">
          <GlobalSearch />
        </div>
        <Link href={'/v1'} className="m-auto glass rounded-md p-1.5 col-span-1">
          <HomeIcon className="stroke-black/50" />
        </Link>
      </article>

      <div className="hidden md:flex z-50 flex-1 overflow-y-scroll">
        <motion.header
          className="fixed inset-x-0 grid grid-rows-2 h-36 py-auto w-full "
          style={{
            height: useTransform(
              scrollYBoundedProgressThrottled,
              [0, 1],
              isMainNav ? [120, 50] : [50, 50],
            ),
            background: useMotionTemplate`
              linear-gradient(
                to top,
                rgba(86, 194, 216, ${useTransform(
                  scrollYBoundedProgressThrottled,
                  [0, 0.85, 1],
                  [0.1, 0.2, 1],
                )}) 0%,

                rgba(206, 229, 158, ${useTransform(
                  scrollYBoundedProgressThrottled,
                  [0, 0.85, 1],
                  [0.1, 0.2, 1],
                )}) 50%,

                rgba(154, 218, 232, ${useTransform(
                  scrollYBoundedProgressThrottled,
                  [0, 0.85, 1],
                  [0.1, 0.2, 1],
                )}) 100%

              )
            `,
          }}
        >
          <nav className="flex flex-col justify-center w-full pt-4  md:mt-4 screen-max-width">
            <section className="flex justify-between items-center ">
              <div className="flex justify-between items-center ">
                <Link href={'/v1'}>
                  <motion.figure
                    style={{
                      scale: useTransform(
                        scrollYBoundedProgressThrottled,
                        [0, 1],
                        [1, 1.2],
                      ),
                    }}
                  >
                    <HomeIcon className="mr-4 stroke-black/60" />
                  </motion.figure>
                </Link>
              </div>
              {/* Desktop Nav */}
              <section className="relative  flex-1 px-6 w-full ">
                <SimpleDesktopMenu />
              </section>

              <div className="flex items-baseline gap-7 max-sm:justify-end max-sm:flex-1">
                <motion.figure
                  style={{
                    scale: useTransform(
                      scrollYBoundedProgressThrottled,
                      [0, 1],
                      [1, 1.3],
                    ),
                  }}
                >
                  <Link
                    href={!!user ? '/v1/user' : '/v1/login'}
                    className="flex justify-center items-center gap-1 text-black/70"
                  >
                    {user?.name ? user.name.split(' ')[0] : 'ورود'}
                    <User2Icon className="text-black/70 ml-4 border border-black/70 p-0.5 rounded-full w-6 h-6" />
                  </Link>
                </motion.figure>
              </div>
            </section>
            <motion.ul
              onMouseLeave={() => {
                setPosition((pv) => ({
                  ...pv,
                  opacity: 0,
                }))
              }}
              className=" flex flex-1 space-x-4 pb-2.5 justify-center  max-sm:hidden "
            ></motion.ul>
          </nav>

          <motion.div
            style={{
              scale: useTransform(
                scrollYBoundedProgressThrottled,
                [0, 1],
                [1, 0],
              ),
            }}
            className={cn(
              isMainNav ? '' : '!hidden !w-0',
              'relative mx-auto self-center w-[325px]',
            )}
          >
            <GlobalSearch />
          </motion.div>
        </motion.header>
      </div>
    </section>
  )
}

export default Navbar
