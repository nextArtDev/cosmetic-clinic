'use client'

import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Ported from the Salvato source (ricardoseola.com/salvato js/main.js) with
// RTL-aware directional flips: x-translation/rotation signs are mirrored so
// entrances move the way a Persian (rtl) reader expects. SplitText/DrawSVG
// are replaced by whole-word spans and stroke-dash drawing so Persian letter
// joining stays intact and no paid plugins are needed.
export function usePageMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const root = ref.current
    if (!root) return
    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (root.querySelector('.hero-word')) {
          gsap
            .timeline()
            .from(
              '.hero-word',
              { opacity: 0, yPercent: 95, rotation: -5, duration: 1, stagger: 0.085, ease: 'power1.out' },
              0.15,
            )
            .from('.hero-subtitle', { opacity: 0, y: 28, duration: 1.35, ease: 'back.out(1)' }, 1.1)
            .from('.hero-cta', { opacity: 0, y: 50, duration: 1.8, ease: 'back.out(1)' }, 1.2)
        }
        gsap.utils.toArray<HTMLElement>('[data-word-reveal]', root).forEach((element) => {
          gsap.from(element.querySelectorAll('.reveal-word'), {
            opacity: 0,
            yPercent: 90,
            rotation: -4,
            duration: 0.95,
            stagger: 0.075,
            ease: 'power2.out',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((element) => {
          gsap.from(element, {
            opacity: 0,
            y: 36,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: element, start: 'top 90%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('.organic-backdrop', root).forEach((element) => {
          gsap.from(element, {
            scaleY: 0.7,
            y: 28,
            transformOrigin: 'center center',
            duration: 1.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: element.parentElement, start: 'top 80%' },
          })
        })
        // Statement: each phrase rises in and each video pill slides from the
        // mirrored edge (source: .statement_span yPercent/rotation +
        // .statement_icon xPercent, stagger 0.2, reverse on scroll-back).
        if (root.querySelector('.statement-section')) {
          const statementTrigger = {
            trigger: '.statement-section',
            start: 'top 70%',
            end: 'bottom center',
            toggleActions: 'play none none reverse',
          }
          gsap.from(root.querySelectorAll('.statement-row > span'), {
            opacity: 0,
            yPercent: 100,
            rotation: -10,
            duration: 1,
            stagger: 0.2,
            ease: 'power1.out',
            scrollTrigger: statementTrigger,
          })
          gsap.from(root.querySelectorAll('.statement-row .statement-video'), {
            opacity: 0,
            xPercent: 100,
            rotation: -10,
            duration: 2,
            stagger: 0.2,
            ease: 'power1.out',
            scrollTrigger: statementTrigger,
          })
        }
        // Contact: photo slides in from the mirrored viewport edge (source:
        // .contato_main.maps from x:100vw) and the droplet outline draws
        // itself (source uses DrawSVG on .drop_line; stroke-dash here).
        if (root.querySelector('.contact-section')) {
          gsap.from('.contact-photo', {
            x: '-100vw',
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.contact-section',
              start: 'top center',
              toggleActions: 'play none none reverse',
            },
          })
          const outlinePath = root.querySelector<SVGPathElement>('.contact-outline-path')
          if (outlinePath) {
            const length = outlinePath.getTotalLength()
            gsap.set(outlinePath, { strokeDasharray: length, strokeDashoffset: length })
            gsap.to(outlinePath, {
              strokeDashoffset: 0,
              duration: 2,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            })
          }
        }
        // Treatment cards: the card label rises into place (source splits
        // .card_title per char; whole-word here keeps Persian shaping).
        if (root.querySelector('.treatment-grid')) {
          gsap.from('.treatment-grid .treatment-card h2', {
            yPercent: 100,
            rotation: -5,
            duration: 1.5,
            stagger: 0.12,
            ease: 'power1.out',
            scrollTrigger: { trigger: '.treatment-grid', start: 'top 30%', toggleActions: 'play none none reverse' },
          })
        }
        // Testimonials: rows are scrub-tied to the section like the source's
        // .to-left/.to-right marquee (replaces the time-based CSS ticker).
        if (root.querySelector('.testimonials-section')) {
          gsap.utils.toArray<HTMLElement>('.testimonial-track', root).forEach((track) => {
            const reverse = track.closest('.testimonial-track-wrap')?.classList.contains('reverse') ?? false
            gsap.fromTo(
              track,
              { x: 0 },
              {
                x: () => (reverse ? -1 : 1) * (track.scrollWidth / 2),
                ease: 'none',
                scrollTrigger: {
                  trigger: '.testimonials-section',
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            )
          })
        }
        // Technology: outline drifts while the video container settles.
        if (root.querySelector('.technology-art')) {
          gsap.to('.technology-outline', {
            x: 36,
            y: 36,
            ease: 'none',
            scrollTrigger: { trigger: '.technology-section', start: 'top 75%', end: 'center center', scrub: 1 },
          })
          gsap.from('.technology-video', {
            borderTopRightRadius: 200,
            borderBottomLeftRadius: 200,
            scaleY: 0.85,
            ease: 'none',
            scrollTrigger: { trigger: '.technology-section', start: 'top 75%', end: 'top 15%', scrub: 1 },
          })
        }
        // Clinic page: hero video unfolds (source .clinica_hero_back_img)
        // and gallery photos settle from a slight tilt (source
        // .clinica-galeria-foto scale/rotation scrub).
        if (root.querySelector('.clinic-hero-video')) {
          gsap.from('.clinic-hero-video', { height: 384, y: 12, duration: 3, ease: 'power2.out' })
        }
        if (root.querySelector('.gallery-grid')) {
          gsap.set('.gallery-button', { scale: 0.95, rotation: -1 })
          gsap.to('.gallery-button', {
            scale: 1,
            rotation: 0,
            ease: 'power2.out',
            stagger: 0.15,
            duration: 2,
            scrollTrigger: { trigger: '.gallery-grid', start: 'top center', scrub: true },
          })
        }
        // Treatment pages: CTA rises in (source .cta_grad flourish) and the
        // related cards grow into place (source .veja_tambem_card height).
        if (root.querySelector('.detail-copy > .glow-cta')) {
          gsap.from('.detail-copy > .glow-cta', { opacity: 0, yPercent: 50, duration: 2, ease: 'back.out(1)' })
        }
        if (root.querySelector('.related-grid')) {
          gsap.from('.related-grid .treatment-card', {
            height: 190,
            duration: 1,
            stagger: 0.2,
            ease: 'power2.inOut',
            scrollTrigger: { trigger: '.related-grid', start: 'top 70%', toggleActions: 'play none none none', once: true },
          })
        }
      })
      media.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => {
        const photo = root.querySelector<HTMLElement>('.journey-photo')
        const target = root.querySelector<HTMLElement>('.treatment-card.face')
        if (photo && target) {
          gsap.fromTo(
            '.journey-entry',
            { x: -480 },
            {
              x: 0,
              ease: 'power2.out',
              scrollTrigger: { trigger: '.intro-section', start: 'top 85%', end: 'top 15%', scrub: 0.8 },
            },
          )
          gsap.set(target, { autoAlpha: 0 })
          const entry = photo.parentElement!
          gsap
            .timeline({
              scrollTrigger: {
                trigger: '.treatments-section',
                start: 'top bottom',
                end: 'top 18%',
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            })
            .to(
              photo,
              {
                x: () =>
                  target.getBoundingClientRect().left -
                  photo.getBoundingClientRect().left +
                  Number(gsap.getProperty(photo, 'x')) +
                  Number(gsap.getProperty(entry, 'x')),
                y: () =>
                  target.getBoundingClientRect().top -
                  photo.getBoundingClientRect().top +
                  Number(gsap.getProperty(photo, 'y')),
                width: () => target.offsetWidth,
                height: () => target.offsetHeight,
                borderRadius: '20px 60px 20px 60px',
                ease: 'power2.inOut',
                duration: 1,
              },
            )
            .set(target, { autoAlpha: 1 })
            .set(photo, { autoAlpha: 0 })
          gsap.from('.treatment-card.hair', {
            x: -190,
            rotation: 8,
            scale: 0.8,
            opacity: 0,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.treatment-grid', start: 'top 72%', toggleActions: 'play none none reverse' },
          })
          gsap.from('.treatment-card.body', {
            x: 190,
            rotation: -8,
            scale: 0.8,
            opacity: 0,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.treatment-grid', start: 'top 72%', toggleActions: 'play none none reverse' },
          })
          gsap.from('.card-outline', {
            inset: 0,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.treatment-grid', start: 'top 45%' },
          })
        }
        if (root.querySelector('.specialty-stage')) {
          gsap.fromTo(
            '.collagen-photo',
            { yPercent: 100 },
            {
              yPercent: 0,
              ease: 'none',
              scrollTrigger: { trigger: '#collagen-panel', start: 'top bottom', end: 'top 22%', scrub: 1 },
            },
          )
          gsap.to('.specialty-glow.cool', {
            opacity: 0.75,
            ease: 'none',
            scrollTrigger: { trigger: '#collagen-panel', start: 'top bottom', end: 'top 30%', scrub: 1 },
          })
          gsap.to('.specialty-glow.warm', {
            opacity: 0,
            ease: 'none',
            scrollTrigger: { trigger: '#collagen-panel', start: 'top bottom', end: 'top 30%', scrub: 1 },
          })
        }
      })
    }, root)
    let alive = true
    document.fonts.ready.then(() => {
      if (alive) ScrollTrigger.refresh()
    })
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => {
      alive = false
      window.removeEventListener('load', refresh)
      media.revert()
      context.revert()
    }
  }, [ref])
}
