'use client'

import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Ported from the Salvato source with RTL-aware directional flips:
// x-translation signs are mirrored so horizontal entrances move the way
// a Persian (rtl) reader expects.
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
        gsap.utils.toArray<HTMLElement>('.statement-row', root).forEach((element, index) => {
          gsap.from(element, {
            opacity: 0,
            y: 50,
            rotation: -3,
            duration: 1.1,
            delay: index * 0.13,
            ease: 'power2.out',
            scrollTrigger: { trigger: element.parentElement, start: 'top 85%' },
          })
        })
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
