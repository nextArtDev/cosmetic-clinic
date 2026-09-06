'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { methodSteps } from '../lib/content'
import { ArrowLink, MaskImage, Reveal, SectionHeading, ease } from './motion-primitives'
import { ClientMarquee, ContactBand, OfferCards, ProjectGrid, Testimonials } from './sections'

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 75])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])
  return (
    <section ref={ref} className="hero" data-hero data-header-theme="light" aria-labelledby="v3-hero-title">
      <motion.div className="hero-image" style={{ y: reduce ? 0 : y }}><motion.img src="/v3/images/hero.webp" alt="Portrait beauté, direction artistique L’AGENCE Design Studio" fetchPriority="high" loading="eager" width="1856" height="2464" initial={{ scale: reduce ? 1 : 1.055 }} animate={{ scale: 1 }} transition={{ duration: 2.3, ease }} /></motion.div>
      <div className="hero-shade" />
      <motion.div className="hero-content" style={{ y: reduce ? 0 : textY, opacity: reduce ? 1 : opacity }}>
        <div className="hero-introduction">
          <motion.p className="eyebrow hero-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}>Image de marque et conception web</motion.p>
          <div className="hero-heading-mask"><motion.h1 id="v3-hero-title" initial={{ y: reduce ? 0 : 95, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.4, delay: 0.5, ease }}>Nous créons des sites web pour les marques <em>beauté</em>, <em>bien-être</em>, <em>food</em> et <em>lifestyle</em> qui travaillent pour vous.</motion.h1></div>
          <motion.p className="hero-subtitle" initial={{ opacity: 0, y: reduce ? 0 : 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.9, ease }}>Un site aligné avec votre positionnement,<br />prêt à performer, et pensé pour votre usage au quotidien.</motion.p>
        </div>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.1, ease }}>
          <Link href="/v3/offres" className="hero-offers-link">Voir nos offres</Link>
          <ArrowLink href="/v3/contact" filled>Prendre un rendez-vous</ArrowLink>
        </motion.div>
      </motion.div>
      <a href="#collaborations" className="hero-scroll" aria-label="Découvrir le studio"><span /></a>
    </section>
  )
}

export function HomePageView() {
  return (
    <main id="v3-main-content">
      <Hero />
      <section className="clients-section" id="collaborations">
        <SectionHeading eyebrow="Projets & collaborations" description="De jeunes entreprises à des maisons reconnues, sur des missions de design et/ou de développement.">Plus de <em>170 projets</em> livrés.</SectionHeading>
        <ClientMarquee />
      </section>

      <section className="editorial-collage content-width" aria-label="Un regard sur notre univers créatif">
        <div className="editorial-left"><MaskImage src="/v3/images/editorial-beauty.webp" alt="Direction artistique pour une marque de beauté premium" className="editorial-tall" /><Reveal className="editorial-caption"><span>Le détail fait la différence.</span><span>Notre regard, votre singularité.</span></Reveal></div>
        <div className="editorial-right"><MaskImage src="/v3/images/editorial-skin.webp" alt="Une approche sensible de la beauté et du soin" className="editorial-wide" /><MaskImage src="/v3/images/editorial-lipstick.webp" alt="Textures et rouges à lèvres : un univers de marque désirable" className="editorial-portrait" /></div>
      </section>

      <section className="audience-section content-width" id="studio">
        <div className="audience-visual"><MaskImage src="/v3/images/studio-editorial.webp" alt="L’univers du studio : beauté, bien-être, food et lifestyle" className="audience-image" /><span className="image-annotation">Une image juste. Une présence qui compte.</span></div>
        <Reveal className="audience-copy"><p className="eyebrow">Pour qui</p><h2>Les marques beauté, bien-être, food et lifestyle qui ont besoin d’<em>un site qui les sert vraiment.</em></h2><h3>Nous vous aidons à passer d’un site qui existe à un site qui travaille pour vous.</h3><ul className="star-list"><li>Vous lancez votre projet et voulez partir sur des bases solides, avec une image et un site pensés pour durer.</li><li>Votre offre s’est précisée, votre vision s’est affinée, mais votre site ne vous ressemble plus.</li><li>Vous voulez prendre une nouvelle direction et repenser votre image pour porter votre prochaine ambition.</li></ul><ArrowLink href="/v3/a-propos">Rencontrer le studio</ArrowLink></Reveal>
      </section>

      <section className="approach-section">
        <div className="content-width"><SectionHeading eyebrow="Notre approche">Un site pensé pour votre <em>positionnement</em>, votre <em>performance</em>, et votre <em>usage</em> réel.</SectionHeading><div className="approach-details"><Reveal><span className="approach-star" aria-hidden="true">❊</span><h3>Nous ne livrons pas seulement un site.<br />Nous livrons un outil taillé pour ce que vous allez en faire.</h3></Reveal><Reveal delay={0.1}><p>Nous alignons votre site avec votre positionnement, pour qu’il porte votre image et votre message sans écart.</p><p>Nous le construisons pour qu’il performe : référencement, vitesse, sécurité pensés dès la conception, pas ajoutés après coup.</p><p>Et nous le pensons pour votre usage au quotidien : vous savez l’exploiter dès la livraison, sans dépendre de nous pour chaque modification.</p><p className="approach-conclusion">C’est cette vision d’ensemble qui fait la différence.</p></Reveal></div></div>
      </section>

      <section className="method-section content-width" id="methode"><SectionHeading eyebrow="Notre méthode" description="Créer le désir. Élever la perception. Positionner votre marque.">Le <em>Brand Desire</em> System<sup>™</sup></SectionHeading><Reveal className="method-description"><p>Un site aligné et performant ne suffit pas s’il ne donne pas envie. Le Brand Desire System™ est notre méthode propriétaire pour que votre site ne se contente pas de fonctionner : il attire, il retient, et il donne envie de vous choisir.</p><ArrowLink href="/v3/methode">Découvrir notre méthode</ArrowLink></Reveal><div className="method-preview">{methodSteps.map((step, index) => <Reveal key={step.title} delay={index * 0.08}><Link href="/v3/methode"><span>( 0{index + 1} )</span><h3>{step.title}</h3><span className="method-preview-arrow" aria-hidden="true">↗</span></Link></Reveal>)}</div></section>

      <section className="offers-section" id="offres"><div className="content-width"><SectionHeading eyebrow="Nos offres" description="Quel que soit votre besoin, un site pensé pour votre positionnement, votre performance, et votre usage.">Pas d’offre par défaut.<br />Une offre pour <em>votre besoin.</em></SectionHeading><OfferCards /><Reveal className="section-bottom-link"><ArrowLink href="/v3/offres">Découvrir les offres</ArrowLink></Reveal></div></section>

      <section className="projects-section content-width" id="realisations"><SectionHeading eyebrow="Réalisations" description="Une expertise particulière dans les secteurs de la beauté et du bien-être, de la food et du lifestyle.">Quelques <em>marques</em> et <em>entreprises</em> que nous avons accompagnées.</SectionHeading><ProjectGrid editorial /><Reveal className="section-bottom-link"><ArrowLink href="/v3/projets">Toutes nos réalisations</ArrowLink></Reveal></section>

      <section className="awards-section" id="recompenses"><div className="content-width"><SectionHeading eyebrow="Récompenses & reconnaissances">Un studio récompensé<br />pour son <em>excellence créative.</em></SectionHeading><div className="award-list">{[{ year: '2026', name: 'L’AGENCE Design Studio', award: 'Nominé' }, { year: '2025', name: 'L’AGENCE Design Studio', award: 'Nominé' }, { year: '2024', name: 'Angélique Damour Design Studio', award: 'Honorable mention' }].map((award, i) => <Reveal className="award-row" key={award.year} delay={i * 0.06}><span className="award-year">{award.year}</span><h3>{award.name}</h3><img src="/v3/images/awwwards.webp" alt="Awwwards" width="120" height="40" loading="lazy" /><span className="award-type">{award.award}</span><span aria-hidden="true">↗</span></Reveal>)}</div></div></section>
      <Testimonials />
      <ContactBand />
    </main>
  )
}
