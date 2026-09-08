'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Reveal from './Reveal'
import { ArrowLeft } from './Icons'
import { site } from '../lib/data'

export default function Feature() {
  const sectionRef = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: imgRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      )
      gsap.to(imgRef.current, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="doctors" ref={sectionRef} className="component overflow-hidden">
      <div className="container-wondr">
        <div className="grid grid-cols-1 items-center gap-y-[6rem] lg:grid-cols-12 lg:gap-x-[4rem]">
          {/* content — RTL: text column on the inline-start (physical right) */}
          <div className="order-2 lg:order-1 lg:col-span-5 lg:col-start-2">
            <Reveal y={30} x={0} skew={2}>
              <span className="eyebrow-wide block lk:text-pink">
                {site.doctorNeuro} · {site.doctorPsych}
              </span>
            </Reveal>

            <Reveal delay={0.1} y={50} x={0} skew={3}>
              <h2 className="mt-[1.6rem] text-[4rem] leading-[6rem] md:text-[5.6rem] md:leading-[8rem]">
                آرامش ذهن یک حق است، نه اثری لوکس
              </h2>
            </Reveal>

            <Reveal delay={0.2} y={40} x={0} skew={2}>
              <div className="mt-[3.2rem] space-y-[2.4rem]">
                <p className="body-lg">
                  با بیش از ۲۲ سال تجربه‌ی بالینی در بیمارستان‌های دانشگاهی و کلینیک‌های
                  تخصصی، شنیدنِ واقعیِ بیمار همیشه اولویت اول ما بوده است.
                </p>
                <p className="body-sm lk:text-ink/70">
                  هر دو متخصص بورد تخصصی خود را از دانشگاه‌های علوم پزشکی تهران و شهید
                  بهشتی گرفته‌اند و فلوشیپ‌های تکمیلی را در مونیخ و لندن گذرانده‌اند؛
                  عضو انجمن مغز و اعصاب ایران و انجمن روان‌پزشکی ایران.
                </p>
                <p className="body-sm lk:text-ink/70">
                  مهم‌تر از همه، درمان اینجا فقط نسخه نیست — از نوار مغز تا روان‌درمانی،
                  همه‌چیز توسط خودِ متخصص‌ها و با پروتکل‌های روزِ جهان انجام می‌شود.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.3} y={30} x={0} skew={2}>
              <div className="mt-[4rem] flex flex-wrap items-center gap-x-[3.2rem] gap-y-[1.6rem]">
                <a href="#treatments" className="btn-tertiary -mr-[2rem]" data-cursor="cta">
                  <span>مشاهده خدمات</span>
                  <ArrowLeft color="#231F20" />
                </a>
                <div className="flex items-center gap-[1.2rem]">
                  <span className="flex -space-x-[1rem] lk:space-x-reverse">
                    {['#EAA098', '#B1DFED', '#F2C8C1'].map((c) => (
                      <span
                        key={c}
                        className="block h-[3.6rem] w-[3.6rem] rounded-full border-2 lk:border-cream"
                        style={{ background: c }}
                      />
                    ))}
                  </span>
                  <span className="body-sm max-w-[16rem] leading-[2rem] lk:text-ink/60">
                    بیش از ۴٬۰۰۰ بیمار از سال ۱۳۹۸
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* image — physical left (inline-end) */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <Reveal y={60} x={0} skew={3} duration={1}>
              <div className="relative flex items-center justify-center">
                <span
                  aria-hidden
                  className="blob-shape absolute inset-[6%] lk:bg-gradient-to-br lk:from-sky-pale lk:via-blush lk:to-rose opacity-80"
                  style={{ animationDuration: '28s' }}
                />
                <div
                  ref={imgRef}
                  className="blob-shape relative aspect-square w-full max-w-[56rem] overflow-hidden"
                  style={{ animationDuration: '40s' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img-v6/image01.jpg"
                    alt="تیم متخصص سیمای آرام"
                    className="h-full w-full scale-[1.04] object-cover"
                  />
                </div>

                {/* floating stat card */}
                <div className="absolute -bottom-[2rem] right-[4%] rounded-[2rem] lk:bg-cream/95 px-[2.4rem] py-[1.8rem] shadow-[0_20px_40px_rgba(0,0,0,.08)] backdrop-blur">
                  <span className="block text-[2.8rem] font-bold leading-[3.6rem] lk:text-pink">
                    +۲۲
                  </span>
                  <span className="block text-[1.1rem] font-semibold lk:text-ink/60">
                    سال تجربه بالینی
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
