import Reveal from './Reveal'
import type { QuickLink } from '../lib/data'
import { hero } from '../lib/data'

export default function QuickLinks({ links }: { links: QuickLink[] }) {
  return (
    <section
      id="quicklinks"
      className="component gradient-section relative overflow-hidden pb-0"
    >
      <div className="container-wondr">
        <div className="mx-auto w-full max-w-[100rem]">
          <Reveal>
            <h2 className="quicklinks-title title-xl mx-auto w-[95%] text-center">
              <a href="#doctors" data-cursor="discover" className="inline-block">
                {hero.quickTitleA} <span>{hero.quickTitleAccent}</span>
                <br className="hidden md:block" /> {hero.quickTitleB}
              </a>
            </h2>
          </Reveal>
        </div>

        <div className="mt-[8.8rem] grid grid-cols-2 gap-y-[5.6rem] lg:grid-cols-4">
          {links.map((link, i) => (
            <Reveal key={link.id} delay={0.1 + i * 0.1} y={40} x={0} skew={3}>
              <a href={link.href} data-cursor="view" className="quick-link group block">
                <span className="relative block">
                  <span className="block overflow-hidden">
                    <span className="block transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:-translate-y-full">
                      {link.labelTop}
                    </span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="block transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:-translate-y-full">
                      {link.labelBottom}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-y-full lk:text-pink transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:translate-y-0"
                  >
                    <span className="block">{link.labelTop}</span>
                    <span className="block">{link.labelBottom}</span>
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      {/* marquee ticker */}
      <div className="marquee-mask mt-[8rem] overflow-hidden border-y lk:border-ink/5 py-[2.4rem]">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {hero.marquee.map((t) => (
                <span
                  key={t}
                  className="flex items-center whitespace-nowrap px-[3rem] text-[1.3rem] font-semibold lk:text-ink/55"
                >
                  {t}
                  <span className="mr-[3rem] inline-block h-[0.6rem] w-[0.6rem] rounded-full lk:bg-pink" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
