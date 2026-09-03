'use client'
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

export interface AnimatedAccordionProps {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  accentColor?: string
  className?: string
  children: ReactNode
}

export interface AccordionItemProps {
  value: string
  className?: string
  children: ReactNode
}

export interface AccordionTriggerProps {
  className?: string
  children: ReactNode
}

export interface AccordionContentProps {
  className?: string
  children: ReactNode
}

interface AccordionCtx {
  openValues: string[]
  toggle: (value: string) => void
  accentColor: string
}

const AccordionContext = createContext<AccordionCtx>({
  openValues: [],
  toggle: () => {},
  accentColor: '#8b5cf6',
})

interface ItemCtx {
  value: string
  isOpen: boolean
}

const ItemContext = createContext<ItemCtx>({
  value: '',
  isOpen: false,
})

function normalise(v?: string | string[]): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function AccordionIcon({
  isOpen,
  accentColor,
}: {
  isOpen: boolean
  accentColor: string
}) {
  return (
    <div className="relative size-6 flex items-center justify-center shrink-0">
      <svg
        className={cn(
          'absolute inset-0 size-full transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
          isOpen ? 'rotate-180' : 'rotate-0',
        )}
        style={{ color: isOpen ? accentColor : undefined }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12"
          strokeDasharray="4 4"
        />
      </svg>

      <div
        className={cn(
          'relative flex items-center justify-center transition-transform duration-500',
          isOpen ? 'rotate-90 scale-110' : 'scale-100',
        )}
      >
        <div
          className="absolute w-3 h-0.5 rounded-full transition-all duration-500"
          style={{ backgroundColor: isOpen ? accentColor : 'currentColor' }}
        />
        <div
          className={cn(
            'absolute h-3 w-0.5 rounded-full transition-all duration-500',
            isOpen ? 'rotate-90 scale-0' : 'scale-100',
          )}
          style={{ backgroundColor: isOpen ? 'transparent' : 'currentColor' }}
        />
      </div>
    </div>
  )
}

export function AnimatedAccordion({
  type = 'single',
  defaultValue,
  accentColor = '#8b5cf6',
  className,
  children,
}: AnimatedAccordionProps) {
  const [openValues, setOpenValues] = useState<string[]>(
    normalise(defaultValue),
  )

  const toggle = useCallback(
    (value: string) => {
      setOpenValues((prev) => {
        const isOpen = prev.includes(value)
        if (isOpen && prev.length === 1) return prev
        if (type === 'single') return [value]
        return isOpen ? prev.filter((v) => v !== value) : [...prev, value]
      })
    },
    [type],
  )

  return (
    <AccordionContext.Provider value={{ openValues, toggle, accentColor }}>
      <div className={cn('relative w-full ', className)}>
        <div className="absolute left-[19px] md:left-[23px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="flex flex-col gap-3 md:gap-4">{children}</div>
      </div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  value,
  className,
  children,
}: AccordionItemProps) {
  const { openValues, toggle, accentColor } = useContext(AccordionContext)
  const isOpen = openValues.includes(value)

  return (
    <ItemContext.Provider value={{ value, isOpen }}>
      <div
        className={cn('relative flex items-start group', className)}
        data-state={isOpen ? 'open' : 'closed'}
      >
        <div className="relative z-10 flex flex-col items-center mt-0.5 mr-3 md:mr-4 shrink-0">
          <button
            type="button"
            onClick={() => toggle(value)}
            aria-expanded={isOpen}
            aria-controls={`accordion-content-${value}`}
            className={cn(
              'size-10 md:size-12 rounded-full flex items-center justify-center transition-all duration-500',
              'border cursor-pointer select-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isOpen
                ? 'bg-background scale-110'
                : 'bg-background border-border text-muted-foreground group-hover:scale-105',
            )}
            style={{
              borderColor: isOpen ? accentColor : undefined,
              boxShadow: isOpen ? `0 0 20px ${accentColor}40` : undefined,
            }}
          >
            <AccordionIcon isOpen={isOpen} accentColor={accentColor} />
          </button>

          <div
            className={cn(
              'absolute top-10 md:top-12 bottom-[-12px] w-0.5 transition-all duration-500 origin-top',
              isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
            )}
            style={{
              background: isOpen
                ? `linear-gradient(to bottom, ${accentColor}, transparent)`
                : undefined,
            }}
          />
        </div>

        <div
          className={cn(
            'flex-1 transition-transform duration-500 ease-out',
            isOpen ? 'translate-x-1' : 'group-hover:translate-x-0.5',
          )}
        >
          {children}
        </div>
      </div>
    </ItemContext.Provider>
  )
}

export function AccordionTrigger({
  className,
  children,
}: AccordionTriggerProps) {
  const { toggle, accentColor } = useContext(AccordionContext)
  const { value, isOpen } = useContext(ItemContext)

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${value}`}
      onClick={() => toggle(value)}
      className={cn(
        'w-full text-right p-3 md:p-4 rounded-2xl overflow-clip border backdrop-blur-md transition-all duration-500',
        'cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isOpen
          ? 'bg-muted/30 rounded-b-none'
          : 'bg-muted/10 border-border/50 hover:bg-muted/20',
        className,
      )}
      style={{ borderColor: isOpen ? `${accentColor}40` : undefined }}
    >
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-150 pointer-events-none',
          isOpen
            ? 'opacity-10 rounded-b-none rounded-t-2xl rounded-e-2xl'
            : 'opacity-0 group-hover:opacity-5',
        )}
        style={{
          background: `linear-gradient(to right, ${accentColor}, transparent)`,
        }}
      />

      <span
        className={cn(
          'relative z-10 text-sm font-medium transition-colors duration-300',
          'group-hover:bg-[linear-gradient(120deg,currentColor_0%,currentColor_35%,rgba(255,255,255,0.2)_50%,currentColor_65%,currentColor_100%)]',
          'group-hover:bg-[length:200%_auto] group-hover:bg-clip-text group-hover:[-webkit-text-fill-color:transparent]',
          'group-hover:animate-[text-shimmer_1.5s_ease-in-out_infinite]',
          isOpen ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {children}
      </span>
    </button>
  )
}

export function AccordionContent({
  className,
  children,
}: AccordionContentProps) {
  const { value, isOpen } = useContext(ItemContext)
  const { accentColor } = useContext(AccordionContext)

  return (
    <div
      id={`accordion-content-${value}`}
      role="region"
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
      aria-hidden={!isOpen}
    >
      <div className="overflow-hidden">
        <div
          className="relative p-4 md:p-5 border border-t-0 rounded-b-2xl backdrop-blur-sm"
          style={{ borderColor: `${accentColor}30` }}
        >
          <div
            className="absolute top-0 left-0 w-full h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${accentColor}50, transparent)`,
            }}
          />
          <div
            className={cn(
              'relative z-10 text-sm text-muted-foreground',
              className,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnimatedAccordion
