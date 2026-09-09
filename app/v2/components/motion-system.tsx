'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { shabnamV2 } from '../fonts'

/**
 * Marks <html> with data-v2-active while any /v2 page is mounted. The
 * attribute gates every html/body-level rule in v2/globals.css, so those
 * styles exist only while a /v2 route is on screen and are gone the moment
 * the user navigates away. The wrapper carries the Persian font variable
 * and the fa-IR/rtl context for the whole port.
 */
export function ShaninaShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v2-active', '')
    return () => {
      html.removeAttribute('data-v2-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div className={`v2 ${shabnamV2.variable}`} lang="fa-IR" dir="rtl">
      {children}
    </div>
  )
}

export function MotionSystem({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  // cleanups registered inside the gsap context (listeners, injected nodes)
  const cleanupsRef = useRef<Array<() => void>>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let context: gsap.Context | undefined
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: !reduced.matches,
      anchors: { duration: 1.3 },
      prevent: (node) => node.hasAttribute('data-lenis-prevent'),
    })
    const tick = (time: number) => lenis.raf(time * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    const refresh = () => ScrollTrigger.refresh()
    const lock = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) lenis.stop()
      else lenis.start()
    }
    window.addEventListener('layout:changed', refresh)
    window.addEventListener('scroll:lock', lock)

    // Sand preloader curtain (ref: simpleLoader). Covers first paint,
    // lifts once fonts + split text are ready. Skipped under reduced
    // motion and on reruns (dev overlays keep it mounted once).
    const preloader = document.createElement('div')
    preloader.className = 'v2-preloader'
    preloader.setAttribute('aria-hidden', 'true')
    document.body.appendChild(preloader)
    const liftPreloader = () => {
      gsap.to(preloader, {
        opacity: 0,
        duration: reduced.matches ? 0 : 0.5,
        onComplete: () => {
          preloader.style.pointerEvents = 'none'
          preloader.remove()
        },
      })
    }

    document.fonts.ready.then(() => {
      if (disposed || !root.current || reduced.matches) {
        liftPreloader()
        return
      }
      liftPreloader()
      context = gsap.context(() => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro.fromTo(
          '.hero-title .title-word',
          { yPercent: 110, rotate: 3, opacity: 0 },
          { yPercent: 0, rotate: 0, opacity: 1, duration: 1.3, stagger: 0.1 },
          0,
        )
        intro.fromTo(
          '.hero-nav a',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.055 },
          0.35,
        )
        intro.fromTo(
          '.hero-copy > *',
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
          0.5,
        )
        intro.fromTo(
          '.hero-facts',
          { opacity: 0 },
          { opacity: 0.4, duration: 1 },
          0.8,
        )
        intro.fromTo(
          '.hero-background img',
          { scale: 1.04 },
          { scale: 1, duration: 1.8, ease: 'power2.out' },
          0,
        )

        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
          gsap.fromTo(
            element,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 94%',
                toggleActions: 'play none none none',
              },
            },
          )
        })

        gsap.utils
          .toArray<HTMLElement>('[data-parallax]')
          .forEach((element) => {
            element.querySelectorAll('img').forEach((image) => {
              gsap.fromTo(
                image,
                { yPercent: -3, scale: 1.09 },
                {
                  yPercent: 3,
                  scale: 1.03,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                  },
                },
              )
            })
          })

        gsap.utils
          .toArray<HTMLElement>('[data-word-reveal]')
          .forEach((element) => {
            gsap.fromTo(
              element.querySelectorAll('.word'),
              { opacity: 0.22 },
              {
                opacity: 1,
                stagger: 0.08,
                ease: 'none',
                scrollTrigger: {
                  trigger: element,
                  start: 'top 78%',
                  end: 'bottom 42%',
                  scrub: 0.5,
                },
              },
            )
          })

        gsap.to('.holistic-image', {
          maskSize: '340%',
          WebkitMaskSize: '340%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.holistic-scene',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        })
        gsap.to('.holistic-marquee', {
          xPercent: 22,
          ease: 'none',
          scrollTrigger: {
            trigger: '.holistic-scene',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        })
        gsap.to('.process-flower', {
          rotation: 160,
          ease: 'none',
          scrollTrigger: {
            trigger: '.process-timeline',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
        gsap.fromTo(
          '.timeline-progress',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            transformOrigin: 'top',
            scrollTrigger: {
              trigger: '.process-timeline',
              start: 'top center',
              end: 'bottom center',
              scrub: 0.5,
            },
          },
        )
        gsap.fromTo(
          '.map-image',
          { scale: 0.94, opacity: 0.35 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.map-panel',
              start: 'top 85%',
              end: 'center center',
              scrub: 0.7,
            },
          },
        )

        /* ---------------------------------------------------------
         * Missing pieces ported from the reference site's main.js:
         * line-masked title reveals, stagger-link char hover, form
         * 3D tilt, floating services cursor, direction-aware header,
         * availability blur-in, and the sand preloader curtain.
         * ------------------------------------------------------- */

        // 1) Line-masked reveals: section titles/paragraphs slide up
        //    out of overflow-hidden line wrappers (ref: processAnimation /
        //    onlineAnimation / reviewsAnimation in main.js).
        gsap.utils
          .toArray<HTMLElement>('[data-line-reveal]')
          .forEach((element) => {
            const split = new SplitText(element, {
              type: 'lines',
              linesClass: 'v2-line-wrap',
            })
            split.lines.forEach((line) => {
              const inner = document.createElement('span')
              inner.className = 'v2-line'
              inner.style.display = 'block'
              inner.innerHTML = line.innerHTML
              line.innerHTML = ''
              line.appendChild(inner)
            })
            gsap.from(split.lines.map((l) => l.firstChild), {
              yPercent: 100,
              opacity: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 75%',
                toggleActions: 'play none none reverse',
              },
            })
          })

        // About story slides swap with a masked line cascade + rotationX
        // (ref: aboutAnimation). The About component dispatches
        // 'v2:about-slide' after each slide change lands.
        const aboutStory = root.current?.querySelector('.about-story')
        if (aboutStory) {
          const playAbout = () => {
            const blocks = aboutStory.querySelectorAll<HTMLElement>(
              '[data-line-reveal]',
            )
            blocks.forEach((block, i) => {
              const split = new SplitText(block, {
                type: 'lines',
                linesClass: 'v2-line-wrap',
              })
              split.lines.forEach((line) => {
                const inner = document.createElement('span')
                inner.className = 'v2-line'
                inner.style.display = 'block'
                inner.innerHTML = line.innerHTML
                line.innerHTML = ''
                line.appendChild(inner)
              })
              gsap.fromTo(
                split.lines.map((l) => l.firstChild),
                { yPercent: 100, opacity: 0, rotationX: -45 },
                {
                  yPercent: 0,
                  opacity: 1,
                  rotationX: 0,
                  duration: 1.2,
                  stagger: 0.12,
                  ease: 'power4.out',
                  delay: i * 0.3,
                },
              )
            })
          }
          window.addEventListener('v2:about-slide', playAbout)
          cleanupsRef.current.push(() =>
            window.removeEventListener('v2:about-slide', playAbout),
          )
        }

        // 2) stagger-link: chars roll up on hover, restore on leave
        //    (ref: common() [stagger-link] handler — header book link,
        //    footer links, submit button).
        gsap.utils
          .toArray<HTMLElement>('[data-stagger-link]')
          .forEach((link) => {
            const textEl = link.querySelector<HTMLElement>('[data-stagger-text]')
            if (!textEl) return
            const split = new SplitText(textEl, {
              type: 'words, chars',
              charsClass: 'v2-char',
            })
            const rollUp = () => {
              gsap.killTweensOf(split.chars)
              gsap.to(split.chars, {
                duration: 0.4,
                yPercent: -110,
                ease: 'power4.inOut',
                overwrite: true,
                stagger: { amount: 0.1, from: 'start' },
              })
            }
            const rollBack = () => {
              gsap.killTweensOf(split.chars)
              gsap.to(split.chars, {
                duration: 0.4,
                yPercent: 0,
                ease: 'power4.inOut',
                overwrite: true,
                stagger: { amount: 0.1, from: 'end' },
              })
            }
            link.addEventListener('mouseenter', rollUp)
            link.addEventListener('mouseleave', rollBack)
            cleanupsRef.current.push(() => {
              link.removeEventListener('mouseenter', rollUp)
              link.removeEventListener('mouseleave', rollBack)
            })
          })

        // 3) Form 3D tilt: rises into place with 1200px perspective
        //    (ref: formSection).
        const bookingForm = root.current?.querySelector('.booking-form')
        const bookingSection = root.current?.querySelector('.booking-section')
        if (bookingForm && bookingSection) {
          gsap.set(bookingSection, { perspective: '1200px' })
          gsap.fromTo(
            bookingForm,
            { rotateX: -20, scale: 0.8 },
            {
              rotateX: 0,
              scale: 1,
              transformOrigin: 'center center',
              ease: 'power2.out',
              scrollTrigger: {
                trigger: bookingForm,
                start: 'top 65%',
                end: 'bottom 50%',
                scrub: 1,
              },
            },
          )
        }

        // 4) Floating services cursor: one gold circle follows the mouse
        //    over the services stack, pops in with back.out (ref:
        //    floatingButtons + hoverButton).
        const services = root.current?.querySelector('.services')
        if (services && window.matchMedia('(pointer: fine)').matches) {
          const follow = document.createElement('div')
          follow.className = 'v2-follow-cursor'
          follow.setAttribute('aria-hidden', 'true')
          services.appendChild(follow)
          const xTo = gsap.quickTo(follow, 'x', { duration: 0.25, ease: 'power3.out' })
          const yTo = gsap.quickTo(follow, 'y', { duration: 0.25, ease: 'power3.out' })
          gsap.set(follow, { scale: 0, pointerEvents: 'none' })
          const move = (event: PointerEvent) => {
            const rect = services.getBoundingClientRect()
            xTo(event.clientX - rect.left - follow.offsetWidth / 2)
            yTo(event.clientY - rect.top - follow.offsetHeight / 2)
          }
          const show = () =>
            gsap.to(follow, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' })
          const hide = () =>
            gsap.to(follow, { scale: 0, duration: 0.25, ease: 'power2.in' })
          services.addEventListener('pointermove', move as EventListener)
          services.addEventListener('pointerenter', show)
          services.addEventListener('pointerleave', hide)
          cleanupsRef.current.push(() => {
            services.removeEventListener('pointermove', move as EventListener)
            services.removeEventListener('pointerenter', show)
            services.removeEventListener('pointerleave', hide)
            follow.remove()
          })
        }

        // 5) Direction-aware header: shows scrolling up, hides scrolling
        //    down (ref: common() header scroll handler). The expanded
        //    nav being open keeps it visible regardless of direction.
        const siteHeader = root.current?.querySelector('.site-header')
        if (siteHeader) {
          let lastY = window.scrollY
          const onScrollDir = () => {
            const y = window.scrollY
            const menuOpen =
              !!siteHeader.getAttribute('aria-expanded') ||
              !!root.current?.querySelector('#expanded-navigation')
            if (y > window.innerHeight) {
              siteHeader.classList.toggle(
                'is-visible',
                y < lastY || menuOpen,
              )
            } else {
              siteHeader.classList.remove('is-visible')
            }
            lastY = y
          }
          window.addEventListener('scroll', onScrollDir, { passive: true })
          cleanupsRef.current.push(() =>
            window.removeEventListener('scroll', onScrollDir),
          )
        }

        // 6) Availability feature cards blur-in (ref: textSection mobile
        //    branch: opacity/scale/blur scrub).
        gsap.utils
          .toArray<HTMLElement>('.availability-features article')
          .forEach((card) => {
            gsap.fromTo(
              card,
              { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
              {
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 85%',
                  end: 'top 55%',
                  scrub: 1,
                },
              },
            )
          })
      }, root)
      ScrollTrigger.refresh()
    })

    return () => {
      disposed = true
      preloader.remove()
      cleanupsRef.current.forEach((fn) => fn())
      cleanupsRef.current = []
      context?.revert()
      gsap.ticker.remove(tick)
      lenis.destroy()
      window.removeEventListener('layout:changed', refresh)
      window.removeEventListener('scroll:lock', lock)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div ref={root}>{children}</div>
    </MotionConfig>
  )
}

export function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, index) => (
        <span className="word" key={`${word}-${index}`}>
          {word}{' '}
        </span>
      ))}
    </>
  )
}
