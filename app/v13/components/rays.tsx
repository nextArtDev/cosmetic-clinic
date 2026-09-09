/**
 * "پرتوها" — the 20 hairline diameters (9° apart) that spin behind the
 * Iran / globe pictograms in the hero. Recreated from the original SVG.
 */
export default function Rays({ className = '' }: { className?: string }) {
  const c = 40
  const r = 40
  const lines = Array.from({ length: 20 }, (_, k) => {
    const a = ((k * 9) * Math.PI) / 180
    const dx = Math.cos(a) * r
    const dy = Math.sin(a) * r
    return (
      <line
        key={k}
        x1={(c - dx).toFixed(2)}
        y1={(c - dy).toFixed(2)}
        x2={(c + dx).toFixed(2)}
        y2={(c + dy).toFixed(2)}
      />
    )
  })
  return (
    <div className={`promienie ${className}`} data-rays>
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="none" stroke="#FFCF87" strokeWidth="0.5" strokeMiterlimit="10">
          {lines}
        </g>
      </svg>
    </div>
  )
}
