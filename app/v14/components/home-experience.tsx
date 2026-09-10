'use client'

import Link from 'next/link'
import { useRef } from 'react'
import CtaButton from './cta-button'
import ForestPath, { type PathController } from './forest-path'
import IranMap from './iran-map'
import NewsletterForm from './newsletter-form'
import Rays from './rays'
import { splitWords } from './split-text'
import { IMG, LINKS } from '../lib/assets'
import { CH3, DROGA, FOOTER, FOREST, HERO, NEWSLETTER, QUOTE, SECOND } from '../lib/site-content'
import { useHomeAnimations } from '../hooks/use-home-animations'
import { useTransitionNavigate } from './page-transition'

export default function HomeExperience() {
  const root = useRef<HTMLDivElement | null>(null)
  const path = useRef<PathController | null>(null)
  const navigate = useTransitionNavigate()

  useHomeAnimations(root, path)

  return (
    <main className="main-wrapper" ref={root}>
      <div className="track" data-track>
        <div className="camera">
          <div className="frame" data-frame>
            {/* ------------------------------------------------ HERO */}
            <section className="section-hero is-green" data-section-hero>
              <div className="container">
                <div className="grid-plain hero-main">
                  <div className="hero-paragraph-wrapper ga-hero-paragraph">
                    <p className="paragraph-standard">{HERO.paragraph}</p>
                    <div className="gradient-courtain" data-gradient-courtain />
                  </div>

                  <div className="cta-hero-wrapper ga-hero-cta">
                    <CtaButton href={LINKS.booking} bgAttr="data-hero-btn-bg" />
                  </div>

                  <div className="hero-img-wrapper ga-hero-img" data-hero-img-wrapper>
                    <div className="hero-img-back-wrapper" data-hero-back-wrap>
                      <img
                        src={IMG.heroBack}
                        loading="eager"
                        alt=""
                        className="hero-image-back"
                        data-hero-back
                      />
                    </div>
                    <div className="hero-img-front-wrap" data-hero-front-wrap>
                      <img
                        src={IMG.heroFront}
                        loading="eager"
                        alt="دکتر آرش نیک‌آیین ایستاده میان درختان"
                        className="hero-img-front"
                        data-hero-front
                      />
                    </div>
                  </div>

                  <div className="h1-hero-wrapper ga-hero-h1" data-h1-wrapper>
                    <h1 className="main-h1 fade-up tricks" data-main-h1>
                      {splitWords(HERO.h1a, true, 'h1a')}
                      <br />
                      <span className="move-h1">{splitWords(HERO.h1b, true, 'h1b')}</span>
                    </h1>
                  </div>

                  <div className="location-wrapper ga-hero-location">
                    <div className="_14px-text fade-up2 tricks" data-loc-text>
                      {splitWords(HERO.locationTop, true, 'l1')}
                    </div>
                    <div className="location-icon-wrapper margin-top-bottom-tiny">
                      <Rays />
                      <IranMap />
                    </div>
                    <div className="hero-line-kurtyna hide-mobile">
                      <div className="_1px-line hero" data-hero-line />
                    </div>
                    <div className="_14px-text margin-top-bottom-tiny fade-up3 tricks" data-loc-text>
                      {splitWords(HERO.locationMid, true, 'l2')}
                    </div>
                    <div className="hero-line-kurtyna">
                      <div className="_1px-line hero" data-hero-line />
                    </div>
                    <div className="location-icon-wrapper margin-top-bottom-tiny">
                      <Rays />
                      <img src={IMG.world} loading="eager" alt="" className="world" data-world />
                    </div>
                    <div className="_14px-text fade-up4 tricks" data-loc-text>
                      {splitWords(HERO.locationBottom, true, 'l3')}
                    </div>
                    <a
                      href={LINKS.booking}
                      className="hero-icons-overlay"
                      aria-label="رزرو جلسه — تهران و آنلاین"
                      onClick={(e) => navigate(e, LINKS.booking)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------ FOREST */}
            <section className="section-enter-forest" data-section-forest>
              <div className="grid-plain enter-forest">
                <div className="enter-1st-para-wrap ga-forest-1">
                  <h2 className="h2-forest _1">
                    <span className="_1-proces-terapii">{FOREST[0].span1}</span>
                    <span className="_2-sie-w-siebie">{FOREST[0].span2}</span>
                    <br />
                    <span className="_3-i-kluczenie">{FOREST[0].span3}</span>
                  </h2>
                </div>
                <div className="enter-2-para-wrap ga-forest-2">
                  <h2 className="h2-forest _2">
                    <span className="_4-jakbys-szukal">{FOREST[1].span1}</span>
                    <span className="_5-przez-ciemny-las">{FOREST[1].span2}</span>
                  </h2>
                </div>
                <div className="enter-3-para-wrap ga-forest-3">
                  <h2 className="h2-forest">
                    <span className="_6-ale-w-koncu">{FOREST[2].span1}</span>
                    <br />
                    <span className="_7-staje-sie">{FOREST[2].span2}</span>
                  </h2>
                </div>
                <div className="enter-4-para-wrap ga-forest-4">
                  <h2 className="h2-forest">
                    <span className="_8-i-mozesz">{FOREST[3].span1}</span>
                    <br />
                    <span className="_9-w-nim">{FOREST[3].span2}</span>
                  </h2>
                </div>
              </div>
              <div className="container forest" data-forest-container>
                <img
                  src={IMG.forest}
                  srcSet={IMG.forestSet}
                  sizes="100vw"
                  alt="جنگلی انبوه و تاریک"
                  className="enter-forest-img"
                  data-forest-img
                />
                <div className="enter-forrest-apla" data-forest-apla />
              </div>
              <ForestPath ref={path} />
            </section>

            {/* ------------------------------------------------ NEWSLETTER */}
            <div className="section-newsletter" data-section-newsletter>
              <div className="mailing-wrapper">
                <h3 className="h3 is-newsletter">
                  <span className="text-color-o-mnie-main-2">{NEWSLETTER.h3a}</span>
                  {NEWSLETTER.h3b}
                </h3>
                <p className="paragraph-bigger is-newsletter">{NEWSLETTER.lead}</p>
                <p className="is-newsletter">{NEWSLETTER.intro}</p>
                <p className="is-newsletter">{NEWSLETTER.listIntro}</p>
                <ul role="list" className="newsletter_list">
                  {NEWSLETTER.items.map((item) => (
                    <li key={item}>
                      <p className="is-newsletter">{item}</p>
                    </li>
                  ))}
                </ul>
                <NewsletterForm />
              </div>
              <img loading="lazy" src={IMG.newsletter} alt="" className="newsletter-image" />
              <div className="newsletter_image-overlay" />
            </div>

            {/* ------------------------------------------------ DROGA PRZEZ LAS */}
            <section className="section-droga-przez-las" data-section-droga>
              <div className="grid-plain _5-columns" data-droga-grid>
                <div className="droga-przez-wrap ga-droga-h3">
                  <h3 id="droga-przez" className="h3 text-color-vb-violet">
                    راهِ میانِ جنگل، <br />
                    یعنی خودِ فرایند درمان
                  </h3>
                </div>
                <div className="flex-v-align-bottom ga-droga-paras">
                  <p className="paragraph-bigger margin-bottom-xtiny" data-droga-p1>
                    {DROGA.p1}
                  </p>
                  <p className="paragraph-standard" data-droga-p2>
                    {DROGA.p2}
                  </p>
                </div>
                <div className="facture-wrapper ga-droga-facture" data-facture-wrapper>
                  <img
                    src={IMG.faktura}
                    srcSet={IMG.fakturaSet}
                    sizes="100vw"
                    loading="lazy"
                    alt="سطحی ناهموار و تیره، پوشیده از گلسنگ"
                    className="facture-img"
                  />
                  <div className="headshot-cutter">
                    <img
                      src={IMG.headshot}
                      alt="پرتره‌ی دکتر نیک‌آیین در نور آفتاب"
                      className="headshot-img"
                    />
                  </div>
                </div>
                <div className="droga-przez-2nd-para-wrap ga-droga-2nd">
                  <div className="cutter right-align-flex">
                    <p className="paragraph-bigger _66-procent">{DROGA.secondBig}</p>
                  </div>
                  <div className="cutter flex-center">
                    <p className="paragraph-standard margin-top-small _66-proc">
                      {DROGA.secondSmall}
                    </p>
                  </div>
                </div>
                <div className="sciezka-w-lesie-wrap ga-droga-sciezka" data-sciezka-wrap>
                  <img
                    src={IMG.sciezka}
                    alt="راهی که از میان جنگل می‌گذرد"
                    className="las-sciezka-img"
                  />
                </div>
              </div>
            </section>

            {/* ------------------------------------------------ VIRGINIA SATIR */}
            <section className="section-second-h2" data-section-h2>
              <div className="grid-plain">
                <div className="second-h2-first-wrap ga-h2-first">
                  <h2 id="chapter2" className="h2 italic ycie fade-up6 tricks">
                    {splitWords(QUOTE.lines[0], false, 'q1')}
                  </h2>
                  <h2 className="h2 italic ale-jest fade-up6 tricks">
                    {splitWords(QUOTE.lines[1], false, 'q2')}
                  </h2>
                  <h2 className="h2 italic sposob fade-up6 tricks">
                    {splitWords(QUOTE.lines[2], false, 'q3')}
                  </h2>
                  <h2 className="h2 italic radzisz fade-up6 tricks">
                    {splitWords(QUOTE.lines[3], false, 'q4')}
                  </h2>
                  <h2 className="h2 italic roznice fade-up6 tricks">
                    {splitWords(QUOTE.lines[4], false, 'q5')}
                  </h2>
                  <div className="text-standard virginia" data-virginia style={{ opacity: 0 }}>
                    {QUOTE.author}
                  </div>
                </div>
                <div className="second-h2-section-para-erap ga-h2-para">
                  <p className="paragraph-standard sa-rzeczy">{QUOTE.paragraph}</p>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------ BIG PICTURE */}
            <section className="section-second-big-picture" data-section-big>
              <div className="grid-plain big-picture">
                <div className="mobile-big-picture-frame ga-big-frame" data-big-frame>
                  <div className="_2nd-big-img-cutter ga-big-cutter">
                    <img
                      src={IMG.bigLas}
                      srcSet={IMG.bigLasSet}
                      sizes="100vw"
                      alt="جنگلی که به گستره‌ی دریا باز می‌شود"
                      className="duzy-las-klif-img"
                    />
                  </div>
                </div>
                <div className="h3-2nd-section-wrap ga-big-h3">
                  <h3 className="h3 sposob">{SECOND.h3}</h3>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------ SECOND CONTENT */}
            <section className="section-second-content" data-section-second>
              <div className="grid-plain _2-columns">
                <div className="two-cell-paragraph-wrapper ga-2nd-two-cell">
                  <p className="paragraph-standard text-color-green margin-adj">{SECOND.p1}</p>
                </div>
                <div className="wydma-wrap ga-2nd-wydma">
                  <img src={IMG.wydma} alt="تپه‌ی شنی" className="wydma-img" />
                </div>
                <div className="wchodzenie-na-wyspe-wrap ga-2nd-wchodzenie">
                  <img
                    src={IMG.wchodzenie}
                    alt="دکتر نیک‌آیین در حال بالا رفتن از تپه‌ی شنی"
                    className="wejscie-na-wydme-img"
                  />
                </div>
                <div className="second-chapter-last-para-wrap ga-2nd-last">
                  <p className="paragraph-bigger text-color-green chce-ci">{SECOND.p2big}</p>
                  <p className="paragraph-standard text-color-green margin-top-small dzieki-terapii">
                    {SECOND.p2small}
                  </p>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------ CHAPTER 3 HERO */}
            <section className="section-hero-3rd-chapter" data-section-ch3-hero>
              <img
                src={IMG.chapter3}
                srcSet={IMG.chapter3Set}
                sizes="100vw"
                alt="ساحلی روشن و بیکران"
                className="chapter-3-img"
              />
              <div className="grid-plain z-index-autp">
                <div className="h1-3rd-chapter-1st-wrap ga-ch3-first">
                  <div className="h2-cutter flex-right negative-margin" data-h2-cutter="1">
                    <h2 className="h2 text-color-dark-slate italic _1st-line" data-ch3-line="1">
                      {CH3.quoteLines[0]}
                    </h2>
                  </div>
                  <div className="h2-cutter" data-h2-cutter="2">
                    <h2 className="h2 text-color-dark-slate italic _2nd-line" data-ch3-line="2">
                      {CH3.quoteLines[1]}
                    </h2>
                  </div>
                  <div className="h2-cutter" data-h2-cutter="3">
                    <h2 className="h2 text-color-dark-slate italic _3rd-line" data-ch3-line="3">
                      {CH3.quoteLines[2]}
                    </h2>
                  </div>
                </div>
                <div className="h1-3rd-chapter-2nd-wrap ga-ch3-second">
                  <div className="h2-cutter" data-h2-cutter="4">
                    <h2 className="h2 text-color-dark-slate italic _4th-line" data-ch3-line="4">
                      {CH3.quoteLines[3]}
                    </h2>
                  </div>
                  <div className="h2-cutter flex-left" data-h2-cutter="5">
                    <h2 className="h2 text-color-dark-slate italic _5th-line-copy" data-ch3-line="5">
                      {CH3.quoteLines[4]}
                    </h2>
                  </div>
                  <div className="quote-autor-wrap">
                    <div className="text-standard text-color-dark-slate">
                      {CH3.quoteAuthor} <br />
                      {CH3.quoteAuthor2}
                    </div>
                  </div>
                </div>
              </div>
              <div className="big-gradient" data-big-gradient />
            </section>

            {/* ------------------------------------------------ CHAPTER 3 CONTENT */}
            <section className="section-3rd-chapter-main-content" data-section-ch3>
              <div className="grid-plain _4-columns">
                <div className="big-txt-wrapper ga-ch3-bigtxt">
                  <div className="left-column-big-txt ga-ch3-left-col">
                    <h3 className="h3 _3rd--chapter">{CH3.h3}</h3>
                  </div>
                  <p className="paragraph-standard text-color-dark-slate margin-top-tiny ga-ch3-para">
                    {CH3.para}
                    <br />
                    <br />
                    {CH3.para2}
                  </p>
                  <div className="top-big-txt-wrap ga-ch3-top">
                    <p
                      className="paragraph-bigger text-color-dark-slate margin-top-bottom-tiny"
                      data-ch3-p
                    >
                      {CH3.topBig}
                    </p>
                    <p className="paragraph-standard text-color-dark-slate margin-top-tiny">
                      {CH3.topSmall}
                    </p>
                  </div>
                </div>
                <div className="plecy-img-holder ga-ch3-plecy">
                  <div className="back-imgae-wrap" data-back-wrap>
                    <img
                      src={IMG.backshot}
                      srcSet={IMG.backshotSet}
                      sizes="(max-width: 1110px) 100vw, 1110px"
                      alt="دکتر نیک‌آیین رو به دریا"
                      className="plecy-img"
                    />
                  </div>
                </div>
                <div className="last-paragraph-wrap ga-ch3-last">
                  <p className="paragraph-standard text-color-dark-slate">
                    {CH3.last}
                    <br />
                    <br />
                    {CH3.last2}
                    <br />
                    <br />
                    {CH3.last3}
                  </p>
                  <CtaButton
                    href={LINKS.bookingPlain}
                    className="margin-top-small margin-10px-bottom"
                    textClassName="text-color-dark-slate"
                    bgAttr="data-final-btn-bg"
                    textAttr="data-final-btn-text"
                  />
                </div>
                <div className="chapter-3-headshot-wrapper ga-ch3-headshot" data-ch3-headshot>
                  <img
                    src={IMG.chapt3Headshot}
                    alt={CH3.headshotAlt}
                    className="chapt-3-headshot-img"
                  />
                </div>
              </div>
            </section>

            {/* ------------------------------------------------ FOOTER */}
            <footer className="footer">
              <div className="footer-info-wrap">
                <div className="footer-text">
                  <Link
                    href="/v14/khabarnameh"
                    className="footer-link"
                    onClick={(e) => navigate(e, '/v14/khabarnameh')}
                  >
                    {FOOTER.newsletter}
                  </Link>
                </div>
                <div className="footer-text">
                  {FOOTER.photography} <br />
                  <a
                    href={FOOTER.photographer_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                  >
                    {FOOTER.photographer}
                  </a>
                </div>
                <div className="footer-text">
                  {FOOTER.site} <br />
                  <a
                    href={FOOTER.studio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                  >
                    {FOOTER.studio}
                  </a>
                </div>
                <div className="footer-text bold">
                  © {FOOTER.copyright} <br />
                  ۱۴۰۴
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}
