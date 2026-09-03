'use client'

import { ReactNode } from 'react'
import OrbitingCircles from './OrbittingCircles'
import MorphingCard from './morphing-card'
import { Circle } from './Orbitting'

export default function Rotating() {
  return (
    <section className="z-[2] mx-auto bg-white  flex w-full h-[70vh]  ">
      <div className="relative group flex h-[70vh]   w-full flex-col items-center justify-center overflow-hidden md:shadow-xl ">
        <span className="relative whitespace-pre-wrap bg-gradient-to-b from-white/30 to-white/20 backdrop-blur-sm bg-clip-text text-center text-8xl font-semibold leading-none text-transparent ">
          <MorphingCard
            width="200px"
            height="200px"
            contents={[
              {
                shape: 'circle',
                title: 'ساعات پذیرش',
                description: 'شنبه 12 تا 13',
              },
              {
                shape: 'rectangle',
                title: 'آدرس',
                description: 'خیابان رودکی',
              },
              {
                shape: 'hexagon',
                title: 'تلفن',
                description: '0935121212',
              },
            ]}
            colorScheme={{ from: '#E7E1D9', to: '#ffffff' }}
            autoPlay={true}
            interval={4000}
          />
        </span>
        <section className=" absolute  left-1/2 top-1/2 -translate-x-2/3 -translate-y-1/2 ">
          <OrbitingCircles
            path={false}
            className="text-white  group-hover:pause z-[2] size-[30px] border-none bg-transparent"
            radius={140}
            duration={40}
            delay={40}
            reverse
          >
            <Content>
              <Circle className="bg-transparent border-none ">
                <h2>بوتاکس</h2>
              </Circle>
            </Content>
          </OrbitingCircles>

          <OrbitingCircles
            path={false}
            className="text-white group-hover:pause z-[2] size-[30px] border-none bg-transparent"
            duration={40}
            delay={5}
            radius={140}
            reverse
          >
            <Content>
              <div className="bg-transparent border-none z-10 flex size-12 items-center justify-center rounded-full   ">
                <h2>فیلر</h2>
              </div>
            </Content>
          </OrbitingCircles>
          <OrbitingCircles
            path={false}
            className=" group-hover:pause z-[2] size-[30px] border-none bg-transparent"
            duration={40}
            delay={10}
            radius={140}
            reverse
          >
            <Content>
              <Circle className="bg-transparent border-none">
                <h2>تزریق ژل</h2>
              </Circle>
            </Content>
          </OrbitingCircles>

          <OrbitingCircles
            path={false}
            className="text-white group-hover:pause z-[2] size-[50px] border-none bg-transparent"
            radius={140}
            duration={40}
            delay={15}
            reverse
          >
            <Content>
              <Circle className="bg-transparent border-none">
                <h2> مزوتراپی</h2>
              </Circle>
            </Content>
          </OrbitingCircles>
          <OrbitingCircles
            path={false}
            className="text-white group-hover:pause z-[2] size-[50px] border-none bg-transparent"
            radius={140}
            duration={40}
            delay={20}
            reverse
          >
            <Content>
              <Circle className="bg-transparent border-none">
                <h2>جراحی بینی</h2>
              </Circle>
            </Content>
          </OrbitingCircles>
          <OrbitingCircles
            path={false}
            className="group-hover:pause z-[2] size-[50px] border-none bg-transparent"
            radius={140}
            duration={40}
            delay={25}
            reverse
          >
            <Content>
              <Circle className="bg-transparent border-none">
                <h2>فیس‌لیفت</h2>
              </Circle>
            </Content>
          </OrbitingCircles>
          <OrbitingCircles
            path={false}
            className="group-hover:pause z-[2] size-[50px] border-none bg-transparent"
            radius={140}
            duration={40}
            delay={30}
            reverse
          >
            <Content>
              <Circle className="bg-transparent border-none">
                <h2>پروتز سینه</h2>
              </Circle>
            </Content>
          </OrbitingCircles>
          <OrbitingCircles
            path={false}
            className="group-hover:pause z-[2] size-[50px] border-none bg-transparent"
            radius={140}
            duration={40}
            delay={35}
            reverse
          >
            <Content>
              <Circle className="bg-transparent border-none">
                <h2>لیپوساکشن</h2>
              </Circle>
            </Content>
          </OrbitingCircles>
        </section>
        {/* <OrbitingCircles
        path={false}
        className="group-hover:pause z-[2] size-[50px] border-none bg-transparent"
        radius={140}
        duration={40}
        delay={40}
        reverse
      >
        <Content>
          <Circle className="bg-transparent border-none">
            <h2>ارتودنسی</h2>
          </Circle>
        </Content>
      </OrbitingCircles> */}
      </div>
    </section>
  )
}

const Content = ({ children }: { children: ReactNode }) => {
  return (
    <article
      style={{ borderRadius: '999' }}
      className="p-1 text-xs md:text-sm h-auto flex items-center justify-center text-center text-[rebeccapurple]  glass backdrop-blur-sm rounded-full font-semibold bg-transparent border-none z-10  size-24   "
    >
      {children}
    </article>
  )
}
