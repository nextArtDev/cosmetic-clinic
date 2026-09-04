'use client'

import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import Image from 'next/image'
import {
  Star,
  CalendarCheck,
  Award,
  Sparkles,
  ArrowLeft,
  StarCheckIcon,
} from 'lucide-react'

import HeroImage from '../../../public/images/doctor-model.webp'
import HeroWindowBG from '../../../public/images/back-hero.png'
import ImageStreamHero from './ImageStream'
import OrbitItems from './OrbitItems'

const IMAGES = [
  { src: '/images/a/bro-lift.webp', alt: 'لیفت ابرو' },
  { src: '/images/a/chin-implant.webp', alt: 'تزریق چانه' },
  { src: '/images/a/injectables.webp', alt: 'بوتاکس' },
  { src: '/images/a/rhino.webp', alt: 'عمل بینی' },
  { src: '/images/a/belfa.webp', alt: 'بلفاپلاستی' },
  { src: '/images/a/bro-lift.webp', alt: 'لیفت ابرو' },
  { src: '/images/a/breast-lift.webp', alt: 'لیفت سینه' },
  { src: '/images/a/chin-implant.webp', alt: 'عمل غبغب' },
  { src: '/images/a/belfa-1.webp', alt: 'بلفاپلاستی' },
]

type RatingStats = {
  avgLabel: string
  countLabel: string
}

type HeroProps = {
  progress?: MotionValue<number>
  /** Real review stats from the DB — drives the orbiting rating stat card. */
  ratingStats?: RatingStats
}

// Premium Glass Card for Orbiting Stats
function OrbitStatCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-white/80 dark:bg-black/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-2 p-3 pointer-events-auto hover:scale-110 transition-transform duration-300 cursor-default">
      <div className="text-amber-500 dark:text-amber-400 mb-1 scale-110">
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">
        {title}
      </p>
      <p className=" text-base font-semibold text-neutral-500 dark:text-neutral-400 text-center uppercase tracking-wider leading-tight">
        {subtitle}
      </p>
    </div>
  )
}

const baseStatItems = [
  <OrbitStatCard
    key={1}
    icon={<Award className="w-10 h-10" />}
    title="۱۵+"
    subtitle="سال تجربه"
  />,
  <OrbitStatCard
    key={2}
    icon={<Sparkles className="w-10 h-10" />}
    title="۵K+"
    subtitle="عمل موفق"
  />,
]

const trailingStatItems = [
  <OrbitStatCard
    key={4}
    icon={<CalendarCheck className="w-10 h-10" />}
    title="۲۴/۷"
    subtitle="مراقبت از بیمار"
  />,
]

const getStatItems = (ratingStats?: RatingStats) => [
  ...baseStatItems,
  <OrbitStatCard
    key={3}
    icon={<StarCheckIcon className="w-10 h-10 " />}
    title={ratingStats?.avgLabel ?? '۴٫۹'}
    subtitle={
      ratingStats ? ` نفر ${ratingStats.countLabel} ` : 'امتیاز ۵ ستاره'
    }
  />,
  ...trailingStatItems,
]

const Hero = ({ progress: progressProp, ratingStats }: HeroProps) => {
  const fallback = useMotionValue(0)
  const progress = progressProp ?? fallback

  const statItems = getStatItems(ratingStats)

  const doctorOpacity = useTransform(progress, [0.02, 0.2], [1, 0])
  const doctorY = useTransform(progress, [0.02, 0.2], [0, 50])
  const doctorScale = useTransform(progress, [0.02, 0.2], [1, 1.12])

  return (
    <div
      className="hero relative isolate w-full overflow-hidden bg-gradient-to-br from-[#FFEEF8]/30 via-white to-[#E8F4F8"
      style={{ height: '100vh' }}
    >
      <ImageStreamHero
        images={IMAGES}
        cards={9}
        speed={35}
        axis={55}
        path={{
          perspective: 100,
          cardWidth: 23,
          cardHeight: 35,
          cardRadius: 1,
          birthHeight: 3,
          exitHeight: 60,
          railBirth: 85,
          railExit: 45,
          fan: 1.5,
          turnBirth: 0,
          turnExit: 5,
          stops: 24,
        }}
        className="absolute inset-0 -z-10 h-full w-full"
      >
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#F5E6CC]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#E0C3FC]/20 rounded-full blur-3xl"></div>

        <Image
          fill
          src={HeroWindowBG}
          alt="hero"
          className="-z-[1] object-cover opacity-60 dark:opacity-40"
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-screen-2xl flex-col px-4 md:px-8">
          <div className="flex items-center justify-between py-6" />

          <div className="relative flex flex-1 flex-col items-center justify-center   gap-8 pb-0  ">
            {/* Left Column: Text, CTA, Rating */}
            <div className="hero-copy flex flex-col items-center md:items-start text-center md:text-left space-y-8 max-w-lg z-20">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance text-[#2C3E50] dark:text-white">
                  دکتر شبنم فضلی
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed text-pretty">
                  فوق تخصص جراحی پلاستیک، زیبایی و ترمیمی
                </p>
              </div>

              {/* <motion.div
                variants={textVariants}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <button className="group flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#D4B872] via-amber-500 to-[#D4B872] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]">
                  <CalendarCheck className="h-5 w-5" />
                  رزرو مشاوره آنلاین
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </button>
                <button className="flex items-center justify-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-black/50 backdrop-blur-md px-8 py-4 text-base font-semibold text-neutral-800 dark:text-neutral-200 transition-all hover:bg-white/80 dark:hover:bg-black/80">
                  مشاهده گالری
                </button>
              </motion.div> */}

              {/* <motion.div
                variants={textVariants}
                className="flex items-center gap-3 pt-2"
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  4.9/5{' '}
                  <span className="text-neutral-500 dark:text-neutral-400">
                    (بیش از ۱۲۰۰ نظر)
                  </span>
                </span>
              </motion.div> */}
            </div>

            {/* Right Column: Doctor & Orbiting Stats */}
            <div className="relative h-full origin-bottom  w-full max-w-md md:max-w-lg flex items-end justify-center z-10  ">
              {/* Doctor Image */}
              <motion.figure
                style={{
                  opacity: doctorOpacity,
                  y: doctorY,
                  scale: doctorScale,
                }}
                className="relative   h-full w-full flex items-end justify-center"
              >
                <Image
                  src={HeroImage.src}
                  alt="دکتر شبنم فضلی"
                  fill
                  priority
                  className="h-auto absolute bottom-0 w-auto object-contain drop-shadow-[0_25px_45px_rgba(80,50,20,0.25)] origin-bottom object-bottom  "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4CA1AF]/10 to-transparent rounded-full blur-3xl scale-75"></div>
              </motion.figure>

              {/* Orbiting Stats Overlay (z-20 to stay in front of doctor) */}
              <div
                dir="ltr"
                className="absolute inset-0 top-[30%] flex items-center justify-center pointer-events-none z-20"
              >
                <OrbitItems
                  items={statItems}
                  showPath
                  shape="heart"
                  baseWidth={650}
                  radiusX={255}
                  radiusY={300} // Taller ellipse to match standing human proportions
                  rotation={-10}
                  duration={40}
                  itemSize={165}
                  direction="reverse"
                  fill={true}
                  responsive={true}
                  easing="linear"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </ImageStreamHero>
    </div>
  )
}

export default Hero

export function AmbientBackground() {
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden bg-[#FBF7F1] dark:bg-[#0B0A09]">
      {/* warm champagne base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#FDFBF7_0%,#F6EDE2_45%,#EFE1D3_100%)] dark:bg-[radial-gradient(120%_120%_at_50%_0%,#171310_0%,#0B0A09_60%)]" />

      {/* slow drifting soft-focus blobs */}
      <motion.div
        animate={{ x: ['0%', '5%', '0%'], y: ['0%', '4%', '0%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-[10%] -top-[10%] h-[55%] w-[55%] rounded-full bg-[#E8CFC4]/60 blur-[120px] dark:bg-[#C5A059]/15"
      />
      <motion.div
        animate={{ x: ['0%', '-5%', '0%'], y: ['0%', '-4%', '0%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[12%] -right-[10%] h-[60%] w-[60%] rounded-full bg-[#F0DDC6]/70 blur-[130px] dark:bg-[#C5A059]/12"
      />
      <motion.div
        animate={{ x: ['0%', '6%', '0%'], y: ['0%', '-5%', '0%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[35%] top-[35%] h-[45%] w-[45%] rounded-full bg-[#E4E1DA]/50 blur-[110px] dark:bg-[#E4E1DA]/5"
      />
    </div>
  )
}
