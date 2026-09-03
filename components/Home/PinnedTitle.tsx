'use client'
//https://codepen.io/snorkltv/pen/Exvgyya?editors=0010
import React, {
  createContext,
  useContext,
  useRef,
  useMemo,
  useEffect,
  ReactNode,
  FC,
} from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// It's important to register GSAP plugins in a client component.
gsap.registerPlugin(ScrollTrigger)

// --- 1. CONTEXT SETUP ---
// This context will hold and provide references to the DOM elements that GSAP will animate.
// Using context avoids "prop drilling" and keeps the component API clean and composable.

interface PinSpacingContextType {
  containerRef: React.RefObject<HTMLDivElement | null>
  logoRef: React.RefObject<HTMLDivElement | null>
  taglineTextRef: React.RefObject<HTMLDivElement | null>
}

// Create the context. The initial value is null because it will only be provided
// within the PinSpacingElements component.
const PinSpacingContext = createContext<PinSpacingContextType | null>(null)

// Custom hook for consuming the context.
// This makes it easier for child components to access the refs and provides a
// clear error message if a component tries to use it outside of the provider.
const usePinSpacing = () => {
  const context = useContext(PinSpacingContext)
  if (!context) {
    throw new Error(
      'usePinSpacing must be used within a PinSpacingElements provider',
    )
  }
  return context
}

// --- 2. COMPONENT DEFINITIONS ---

// A. The Main Provider Component (PinSpacingElements)
// This is the main wrapper that sets up the GSAP animations and provides the context.
interface PinSpacingElementsProps {
  children: ReactNode
  start?: string
  end?: string
  LogoVars?: gsap.TweenVars
  TextVars?: gsap.TweenVars
  pin?: boolean
  pinSpacing?: boolean
  scrub?: number
}

export const PinSpacingElements: FC<PinSpacingElementsProps> = ({
  children,
  start = 'top top',
  end = '+=700px',
  LogoVars,
  TextVars,
  pin = true,
  scrub = 1,
  pinSpacing = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const taglineTextRef = useRef<HTMLDivElement>(null)

  // The core animation logic is encapsulated in this useEffect hook.
  useEffect(() => {
    // gsap.context() is the modern and recommended way to handle GSAP animations in React.
    // It automatically handles cleanup, preventing memory leaks when the component unmounts.
    const ctx = gsap.context(() => {
      // gsap.matchMedia() is used for creating responsive animations.
      const mm = gsap.matchMedia()

      // Animation setup for users who have not requested reduced motion.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // We only run the animation if the main container ref is attached.
        if (containerRef.current) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start,
              end, // The element will be pinned for a scroll distance of 700px
              pin: pin,
              scrub: scrub, // Smoothly syncs the animation with the scrollbar
              pinSpacing: pinSpacing, // Adds padding to the bottom of the trigger to avoid content jumps
            },
          })

          // Animate the logo if its ref is present
          if (logoRef.current) {
            tl.from(logoRef.current, {
              width: 0,
              duration: 0.8,
              ease: 'power1.in',
              ...LogoVars,
            })
          }

          // Animate the tagline text if its ref is present
          if (taglineTextRef.current) {
            tl.from(taglineTextRef.current, {
              opacity: 0, // IF YOU WANT FIRST APPEARANCE NONE
              yPercent: -100,
              stagger: 0.05,
              duration: 0.3,
              ...TextVars,
            })
          }
        }
      })

      // Fallback for users who prefer reduced motion. This makes the component accessible.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (containerRef.current) {
          gsap.set(containerRef.current, { opacity: 1 }) // Simply make it visible
        }
      })
    }, containerRef) // Scope the context to the containerRef for better performance and cleanup.

    // The cleanup function returned by useEffect. GSAP's context handles this automatically.
    return () => ctx.revert()
  }, []) // The empty dependency array ensures this effect runs only once when the component mounts.

  // useMemo ensures the context value object is stable across re-renders,
  // preventing unnecessary re-renders in consumer components.
  const contextValue = useMemo(
    () => ({
      containerRef,
      logoRef,
      taglineTextRef,
    }),
    [], // No dependencies, so this object is created only once.
  )

  return (
    <PinSpacingContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="ad_wrapper flex h-[30vh] items-center justify-center overflow-hidden  p-5 md:h-[50vh]"
      >
        <div className="ad_content w-full max-w-sm">{children}</div>
      </div>
    </PinSpacingContext.Provider>
  )
}

// B. Composable Child Components (Logo and Text)
// These components are designed to be used inside PinSpacingElements.
// They use the custom hook to get the refs they need to be animated.

interface LogoProps {
  children: ReactNode
  className?: string
}

export const Logo: FC<LogoProps> = ({ children, className = '' }) => {
  const { logoRef } = usePinSpacing() // Consume the context
  return (
    <div ref={logoRef} className="logo overflow-hidden">
      <h1
        className={`w-full bg-[#f39] p-4 text-center text-5xl italic text-white md:text-6xl rounded-lg ${className}`}
      >
        {children}
      </h1>
    </div>
  )
}

interface TextProps {
  children: ReactNode
  className?: string
}

export const Text: FC<TextProps> = ({ children, className = '' }) => {
  const { taglineTextRef } = usePinSpacing() // Consume the context
  return (
    <div ref={taglineTextRef} className="tagline mt-2 overflow-hidden">
      <h2
        className={`tagline_text w-full text-center text-2xl text-gray-300 md:text-4xl ${className}`}
      >
        {children}
      </h2>
    </div>
  )
}

/*
 * --- HOW TO USE IN YOUR NEXT.JS PAGE (e.g., app/page.tsx) ---
 *
 * import { PinSpacingElements, Logo, Text } from './your-component-file';
 *
 * export default function HomePage() {
 * return (
 * <main>
 * <div className="h-screen flex items-center justify-center">
 * <h1>Scroll Down</h1>
 * </div>
 *
 * // Example 1: Using both Logo and Text
 * <PinSpacingElements>
 * <Logo>Composable</Logo>
 * <Text>And Powerful</Text>
 * </PinSpacingElements>
 *
 * <div className="h-screen" />
 *
 * // Example 2: Using only the Logo
 * <PinSpacingElements>
 * <Logo className="bg-blue-600">Just The Logo</Logo>
 * </PinSpacingElements>
 *
 * <div className="h-screen" />
 *
 * </main>
 * );
 * }
 *
 */
