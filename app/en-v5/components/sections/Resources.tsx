'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  BookOpen,
  MapPin,
  Stethoscope,
  TrainFront,
} from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Reveal, { StaggerGroup, StaggerItem } from '../ui/Reveal'
import Button from '../ui/Button'
import { site } from '../../lib/site'

const cards = [
  {
    key: 'diagnostic',
    badge: 'Gratuit',
    icon: Stethoscope,
    title: 'Diagnostic capillaire',
    meta: '2 min · réponse sous 72 h',
    text: 'Décrivez votre situation, ajoutez quelques photos si vous le souhaitez : un médecin vous répond avec une première lecture et une fourchette de greffons.',
    href: '/v5/diagnostic',
    action: 'Commencer',
    image: '/v5/images/diagnostic.webp',
  },
  {
    key: 'guide',
    badge: 'PDF · 12 pages',
    icon: BookOpen,
    title: 'Guide post-opératoire',
    meta: 'Lavages · sommeil · sport · reprise',
    text: "Tout ce qu'il faut savoir après la greffe, jour par jour, pour ne pas se poser de questions inutiles. Envoyé par e-mail.",
    href: '/v5/#contact',
    action: 'Recevoir le guide',
    image: '/v5/images/guide.webp',
  },
]

export default function Resources() {
  return (
    <section
      id="centre"
      className="nc:relative nc:bg-white nc:py-24 nc:sm:py-32"
    >
      <div className="nc:mx-auto nc:max-w-7xl nc:px-5 nc:sm:px-8">
        <div className="nc:grid nc:gap-12 nc:lg:grid-cols-12 nc:lg:gap-10">
          {/* Resource cards */}
          <div className="nc:lg:col-span-7">
            <SectionHeading
              eyebrow="Ressources"
              title={'Deux outils pour\n*avancer* sereinement'}
            />
            <StaggerGroup className="nc:mt-10 nc:grid nc:gap-4 nc:sm:grid-cols-2">
              {cards.map((c) => (
                <StaggerItem key={c.key}>
                  <Link
                    href={c.href}
                    className="nc:group nc:relative nc:flex nc:h-full nc:flex-col nc:overflow-hidden nc:rounded-[24px] nc:bg-paper nc:ring-1 nc:ring-ink/5 nc:transition-all nc:duration-500 nc:hover:-translate-y-1 nc:hover:shadow-lift"
                  >
                    <div className="nc:relative nc:aspect-[16/10] nc:overflow-hidden">
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="(min-width:1024px) 28vw, (min-width:640px) 45vw, 100vw"
                        className="nc:object-cover nc:transition-transform nc:duration-[1.4s] nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:scale-105"
                      />
                      <span className="nc:absolute nc:left-4 nc:top-4 nc:rounded-full nc:bg-white/90 nc:px-3 nc:py-1 nc:text-[11px] nc:font-bold nc:uppercase nc:tracking-[0.16em] nc:text-ink nc:backdrop-blur">
                        {c.badge}
                      </span>
                    </div>
                    <div className="nc:flex nc:flex-1 nc:flex-col nc:p-6">
                      <p className="nc:flex nc:items-center nc:gap-2 nc:text-[12px] nc:font-semibold nc:text-graphite">
                        <c.icon className="nc:size-4 nc:text-sage" /> {c.meta}
                      </p>
                      <h3 className="nc:mt-2 nc:text-[1.3rem] nc:font-semibold nc:tracking-[-0.02em]">
                        {c.title}
                      </h3>
                      <p className="nc:mt-2 nc:flex-1 nc:text-[14px] nc:leading-relaxed nc:text-graphite">
                        {c.text}
                      </p>
                      <span className="nc:mt-5 nc:inline-flex nc:items-center nc:gap-2 nc:text-[13.5px] nc:font-semibold nc:text-ink">
                        {c.action}
                        <span className="nc:grid nc:size-7 nc:place-items-center nc:rounded-full nc:bg-ink nc:text-white nc:transition-all nc:duration-500 nc:group-hover:rotate-45 nc:group-hover:bg-sage">
                          <ArrowUpRight className="nc:size-3.5" />
                        </span>
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          {/* Centre */}
          <Reveal delay={2} className="nc:lg:col-span-5">
            <div className="nc:relative nc:flex nc:h-full nc:flex-col nc:overflow-hidden nc:rounded-[28px] nc:bg-ink nc:text-white nc:shadow-lift">
              <div className="nc:relative nc:aspect-[4/3] nc:overflow-hidden">
                <Image
                  src="/v5/images/clinic.webp"
                  alt="Accueil du centre NOVA Capillaire, boulevard du Montparnasse"
                  fill
                  sizes="(min-width:1024px) 38vw, 100vw"
                  className="nc:object-cover"
                />
                <div className="nc:absolute nc:inset-0 nc:bg-gradient-to-t nc:from-ink nc:via-ink/20 nc:to-transparent" />
                <p className="eyebrow dot-white nc:absolute nc:left-6 nc:top-6 nc:text-sage-soft">
                  Le centre
                </p>
              </div>
              <div className="nc:relative nc:-mt-10 nc:flex nc:flex-1 nc:flex-col nc:p-7">
                <h3 className="letterpress-light nc:text-[clamp(1.5rem,2.4vw,2rem)] nc:font-semibold nc:leading-tight nc:tracking-[-0.03em]">
                  Un seul lieu, une seule équipe, du diagnostic au douzième
                  mois.
                </h3>
                <ul className="nc:mt-6 nc:space-y-3 nc:text-[14px] nc:text-white/75">
                  <li className="nc:flex nc:items-start nc:gap-3">
                    <MapPin className="nc:mt-0.5 nc:size-4 nc:shrink-0 nc:text-sage-soft" />
                    {site.address}
                  </li>
                  <li className="nc:flex nc:items-start nc:gap-3">
                    <TrainFront className="nc:mt-0.5 nc:size-4 nc:shrink-0 nc:text-sage-soft" />
                    Métro Vavin (4) · Montparnasse-Bienvenüe (4, 6, 12, 13) ·
                    Parking à 200 m
                  </li>
                </ul>
                <div className="nc:mt-8 nc:flex nc:flex-wrap nc:gap-2">
                  <Button href="/v5/#contact" variant="dark" size="sm">
                    Prendre rendez-vous
                  </Button>
                  <Button
                    href={site.mapsHref}
                    variant="outline"
                    size="sm"
                    icon="external"
                    className="nc:!text-white nc:!ring-white/30"
                  >
                    Itinéraire
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
