'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase)
}

/** Easing names used by the original thegrind.nl Webflow interactions. */
export const EASE = {
  outQuart: 'power4.out',
  outExpo: 'expo.out',
  inOutExpo: 'expo.inOut',
  linear: 'none',
  /** cubic-bezier(0.988,0.27,0.561,1.457) — overshooting pop for the sun rays */
  rays: 'cubic-bezier(0.988,0.27,0.561,1.457)',
}

export const DESKTOP_QUERY = '(min-width: 992px)'
export const MOBILE_MENU_QUERY = '(max-width: 767px)'

export { gsap, ScrollTrigger }
