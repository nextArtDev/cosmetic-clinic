import { cn } from '@/lib/utils'

interface FlowShellProps {
  eyebrow?: string
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

/**
 * Shared dark cinematic backdrop for the home booking flow (booking,
 * payment and result pages) — mirrors the landing's ambient glow look.
 */
export function FlowShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: FlowShellProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-screen flex-col overflow-hidden bg-canvas-deep pb-28 pt-32',
        className,
      )}
    >
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 right-[15%] h-[28rem] w-[28rem] rounded-full bg-[#30e8bf]/15 blur-[130px]" />
        <div className="absolute top-1/3 left-[10%] h-80 w-80 rounded-full bg-[#e96f18]/10 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {(eyebrow || title) && (
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          {eyebrow && (
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#30e8bf] backdrop-blur-sm">
              {eyebrow}
            </span>
          )}
          {title && (
            <h1 className="mt-5 text-3xl font-bold text-white md:text-5xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 md:text-base">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="relative mt-12 flex-1 px-4 sm:px-6">{children}</div>
    </section>
  )
}
