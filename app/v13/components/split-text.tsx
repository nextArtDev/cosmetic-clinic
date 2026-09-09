import type { ReactNode } from 'react'

/**
 * Port of the "tricks" split-text helper from the original site, adapted
 * for Persian: Arabic-script letters are cursive, so splitting into
 * per-character spans would destroy letter joining. Every unit is a whole
 * word instead — when `letters` is true the word spans also carry the
 * `.letter` class so the load-stagger hooks (`.fade-up .letter` etc.)
 * keep working with zero changes to the animation code.
 */
export function splitWords(text: string, letters = true, keyPrefix = 'w'): ReactNode[] {
  const parts = text.split(/(\s+)/)
  return parts.map((part, i) => {
    if (part.trim() === '') {
      return part.length ? ' ' : null
    }
    return (
      <span className={letters ? 'tricksword letter' : 'tricksword'} key={`${keyPrefix}-${i}`}>
        {part}
      </span>
    )
  })
}

export function SplitText({
  text,
  letters = true,
  className,
}: {
  text: string
  letters?: boolean
  className?: string
}) {
  return <span className={className}>{splitWords(text, letters)}</span>
}
