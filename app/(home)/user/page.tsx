import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'
import {
  getAppTimeZone,
  toClinicHHMM,
  toClinicDateISO,
} from '@/lib/scheduling/tz'
import { CalendarPlus, CalendarCheck, UserRound } from 'lucide-react'
import {
  fetchVisitsPage,
  fetchVisitStats,
  VISITS_PAGE_SIZE,
  jalaliLabel,
  weekdayLabel,
  STATUS_LABEL,
} from './lib/visit-data'
import { InfiniteVisits } from './components/infinite-visits'

export const metadata: Metadata = {
  title: 'پرونده و ویزیت‌های من',
  description:
    'تایم‌لاین ویزیت‌های جراحی زیبایی؛ نوبت‌های گذشته و آینده و مراحل درمانی ثبت‌شده برای شما.',
}

export default async function UserVisitsPage() {
  const sessionUser = await currentUser()
  if (!sessionUser?.id) redirect('/signin?callbackUrl=/user')

  const profile = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      bio: true,
      gender: true,
      createdAt: true,
    },
  })
  if (!profile) redirect('/signin?callbackUrl=/user')

  const tz = getAppTimeZone()

  const [initialPage, stats] = await Promise.all([
    fetchVisitsPage(profile.id, null, VISITS_PAGE_SIZE),
    fetchVisitStats(profile.id),
  ])
  const initialNodes = initialPage.nodes
  const initialCursor = initialPage.nextCursor

  const totalVisits = stats.totalVisits
  const upcoming = stats.upcoming
  const completedCount = stats.completedCount

  return (
    <ViewTransition
      name="page"
      share="page-wipe"
      enter="page-wipe"
      exit="page-wipe"
      default="none"
    >
      <div className="min-h-screen bg-ink text-ivory">
        {/* Top navigation */}
        <header className="sticky top-0 z-40 border-b border-glass-border bg-ink/85 backdrop-blur-md">
          {/* pl-24 is intentionally PHYSICAL: it clears the fixed hamburger
            toggle (top-left, position:fixed) which is itself physical — a
            logical ps-24 would move the padding to the RTL start (right). */}
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 pl-24">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-sm font-bold text-ivory transition-opacity hover:opacity-80"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sage to-gold text-sm text-ink">
                ف
              </span>
              کلینیک دکتر نگین فضلی
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/booking"
                className="inline-flex items-center gap-1.5 rounded-full border border-glass-border px-4 py-2 text-xs font-semibold text-ivory-dim transition-colors hover:border-gold/50 hover:text-gold-soft"
              >
                <CalendarPlus size={14} />
                رزرو نوبت
              </Link>
              <Link
                href="/v1/user"
                className="inline-flex items-center gap-1.5 rounded-full border border-glass-border px-4 py-2 text-xs font-semibold text-ivory-dim transition-colors hover:border-gold/50 hover:text-gold-soft"
              >
                <UserRound size={14} />
                حساب کامل
              </Link>
            </div>
          </nav>
        </header>

        <div className="mx-auto max-w-6xl px-6 pt-20">
          <p className="text-xs font-semibold tracking-widest text-sage-bright">
            حساب بیمار
          </p>
          <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">
            پرونده و ویزیت‌های{' '}
            <span className="italic text-sage-mist">{profile.name}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-dim">
            تمام نوبت‌ها و مراحل درمانی شما به‌صورت یک تایم‌لاین مرتب ثبت شده
            است — با اسکرول در صفحه، خط زمان پر می‌شود و هر ویزیت در تاریخ خودش
            ظاهر می‌شود.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
            {/* Profile summary */}
            <aside className="glass-panel h-fit p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage to-sage-bright text-lg font-bold text-ink">
                  {profile.name.trim().charAt(0) || '؟'}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-ivory">
                    {profile.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ivory-dim">
                    {profile.phoneNumber}
                  </p>
                  <p className="truncate text-xs text-ivory-dim">
                    {profile.email}
                  </p>
                </div>
              </div>

              {profile.bio ? (
                <p className="mt-5 border-t border-glass-border pt-5 text-xs leading-relaxed text-ivory-dim">
                  {profile.bio}
                </p>
              ) : null}

              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-glass-border pt-6 text-center">
                <div>
                  <dt className="text-[11px] text-ivory-dim">کل ویزیت‌ها</dt>
                  <dd className="mt-1 font-display text-xl text-gold-soft">
                    {totalVisits}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-ivory-dim">پیشِ رو</dt>
                  <dd className="mt-1 font-display text-xl text-sage-bright">
                    {upcoming.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-ivory-dim">انجام شده</dt>
                  <dd className="mt-1 font-display text-xl text-ivory">
                    {completedCount}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 border-t border-glass-border pt-5 text-[11px] text-ivory-dim">
                عضویت از{' '}
                <span className="text-gold-soft">
                  {format(profile.createdAt, 'MMMM yyyy', { locale: faIR })}
                </span>
                {profile.gender ? (
                  <> · {profile.gender === 'male' ? 'آقا' : 'خانم'}</>
                ) : null}
              </p>
            </aside>

            {/* Upcoming visits */}
            <section className="glass-panel h-fit p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg text-ivory">
                    نوبت‌های پیشِ رو
                  </h2>
                  <p className="mt-1 text-xs text-ivory-dim">
                    نزدیک‌ترین ویزیت‌های برنامه‌ریزی‌شده
                  </p>
                </div>
                <CalendarCheck size={20} className="text-sage-bright" />
              </div>

              {upcoming.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-glass-border p-6 text-center">
                  <p className="text-sm text-ivory-dim">نوبت فعالی ندارید.</p>
                  <Link
                    href="/booking"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sage to-sage-bright px-5 py-2 text-xs font-bold text-ink transition-transform hover:scale-105"
                  >
                    <CalendarPlus size={14} />
                    رزرو نوبت جدید
                  </Link>
                </div>
              ) : (
                <ul className="mt-6 space-y-3">
                  {upcoming.map((a) => {
                    const dateISO = toClinicDateISO(a.appointmentStartUTC, tz)
                    return (
                      <li
                        key={a.appointmentId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-glass-border bg-glass-bg px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ivory">
                            {a.reasonForVisit || 'ویزیت زیبایی'}
                          </p>
                          <p className="mt-0.5 text-xs text-ivory-dim">
                            {weekdayLabel(dateISO)}، {jalaliLabel(dateISO)} ·
                            ساعت {toClinicHHMM(a.appointmentStartUTC, tz)}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold-soft">
                          {STATUS_LABEL[a.status] ?? a.status}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>

        {/* Full-width scroll-driven visits timeline (infinite scroll) */}
        {initialNodes.length === 0 ? (
          <section className="mx-auto max-w-3xl px-6 pb-28 pt-16">
            <div className="glass-panel p-10 text-center">
              <h2 className="font-display text-xl text-ivory">
                تایم‌لاین ویزیت‌ها
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ivory-dim">
                هنوز ویزیتی یا مرحله‌ای از درمان برای شما ثبت نشده است. به‌محض
                اولین نوبت، سیر درمانی شما این‌جا به‌صورت یک تایم‌لاین ظاهر
                می‌شود.
              </p>
              <Link
                href="/booking"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sage to-sage-bright px-6 py-3 text-sm font-bold text-ink transition-transform hover:scale-105"
              >
                <CalendarPlus size={16} />
                رزرو اولین نوبت
              </Link>
            </div>
          </section>
        ) : (
          <InfiniteVisits
            initialNodes={initialNodes}
            initialCursor={initialCursor}
            hasMore={initialCursor !== null}
          />
        )}
      </div>
    </ViewTransition>
  )
}
