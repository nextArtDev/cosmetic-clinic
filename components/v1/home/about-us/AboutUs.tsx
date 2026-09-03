'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
export default function AboutUs() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.5])

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-7xl w-full h-full flex flex-col "
    >
      <article className="absolute  top-16 w-full  h-72 md:h-96 xl:h-[25rem]">
        <div className="relative w-full  h-full overflow-hidden">
          <Image
            unoptimized
            width={1200}
            height={600}
            className=" object-cover origin-top "
            src={'/v1/images/kosar-4.jpg'}
            alt="مجتمع پزشکی کوثر مسجدسلیمان"
          />
          <motion.div
            className={cn(
              'absolute bg-gradient-to-t from-white/10 to-transparent backdrop-blur-[1px] inset-0'
            )}
          ></motion.div>
        </div>
        <motion.div style={{ scale }} className="absolute inset-0">
          <div className="relative h-full w-full ">
            <Image
              unoptimized
              width={150}
              height={150}
              className="scale-125 object-cover z-10 absolute -bottom-20 left-1/2 -translate-x-1/2 glass  rounded-full  "
              src={'/v1/images/logo.png'}
              alt="مجتمع پزشکی کوثر مسجدسلیمان"
            />
          </div>
        </motion.div>
      </article>
      <article className="px-4 pt-8 pb-16 max-w-5xl mx-auto text-justify mt-[60vh] md:mt-[95vh]  text-black/90">
        <h1 className="font-bold title-color text-2xl text-center md:text-4xl lg:text-6xl">
          مجتمع پزشکی کوثر
        </h1>
        <p className="my-12  text-justify">
          مجتمع پزشکی کوثر با مدیریت دکتر غلامرضا خواجه‌پور (نظام پزشکی 55422)
          می‌باشد که جهت رفاه حال بیماران دارای بخش‌های:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>
            <strong className="sub-title-color">آزمایشگاه پاتوبیولوژی:</strong>{' '}
            با بیش از 35 سال سابقه درخشان، اولین آزمایشگاه خصوصی شهرستان
            مسجدسلیمان، مجهز به دستگاه‌های جدید و پیشرفته با کادری مجرب که کلیه
            آزمایشات تخصصی و فوق تخصصی را انجام می‌دهد و طرف قرارداد با کلیه
            بیمه‌های پایه و تکمیلی، که جهت خدمت‌رسانی به همشهریان عزیز بصورت
            شبانه‌روزی می‌باشد.
          </li>
          <li>
            <strong className="sub-title-color">
              مرکز ترک اعتیاد و بازتوانی:
            </strong>{' '}
            که در دو شیفت صبح و عصر در خدمت بیماران محترم می‌باشد.
          </li>
          <li>
            <strong className="sub-title-color">کلینیک سرپایی:</strong> که دارای
            پزشک عمومی، پزشک متخصص، تزریقات، پانسمان و کلیه اعمال جراحی سرپایی،
            نوار قلب، شستشوی گوش، حجامت، لیزر و زیبایی، بینایی سنجی، سنجش شنوایی
            و تست سرگیجه و تعادل، نوار مغز، نوار عصب و عضله می‌باشد.
          </li>
        </ul>
      </article>
    </section>
  )
}
