'use client'

import { motion } from 'framer-motion'
import Reveal from './Reveal'
import { ArrowLeft, Flower } from './Icons'

export default function CrossSell() {
  return (
    <section id="book" className="component overflow-hidden">
      <div className="container-wondr">
        <div className="grid grid-cols-1 gap-y-[8rem] lg:grid-cols-12 lg:gap-x-[4rem]">
          <Reveal className="lg:col-span-5" y={50} x={0} skew={3}>
            <div className="relative pt-[9.6rem]">
              <span aria-hidden className="cross-blob" />
              <Flower className="absolute right-0 top-0 h-[7.2rem] w-[7.2rem] spin-slow" />
              <div className="relative z-[1]">
                <h2 className="text-[3.6rem] leading-[5rem] md:text-[4.4rem] md:leading-[6.2rem]">
                  آماده‌ی رزرو نوبت هستید؟
                </h2>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <a href="#enquire" className="btn-secondary mt-[2.4rem]" data-cursor="book">
                    <span>رزرو نوبت</span>
                    <ArrowLeft color="#231F20" />
                  </a>
                </motion.div>
              </div>
            </div>
          </Reveal>

          <Reveal
            className="lg:col-span-5 lg:col-start-8"
            delay={0.15}
            y={50}
            x={0}
            skew={3}
          >
            <div className="relative pt-[9.6rem]">
              <span aria-hidden className="cross-blob cross-blob--sky" />
              <Flower className="absolute right-0 top-0 h-[7.2rem] w-[7.2rem] spin-slow" />
              <div className="relative z-[1]">
                <h2 className="text-[3.6rem] leading-[5rem] md:text-[4.4rem] md:leading-[6.2rem]">
                  می‌خواهید درباره‌ی شرایط‌تان بپرسید؟
                </h2>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <a href="#enquire" className="btn-secondary mt-[2.4rem]" data-cursor="cta">
                    <span>ثبت درخواست</span>
                    <ArrowLeft color="#231F20" />
                  </a>
                </motion.div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
