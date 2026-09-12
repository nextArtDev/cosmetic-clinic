'use client'

import { Flame } from 'lucide-react'

const WORDS = ['قدرت', 'استقامت', 'انعطاف', 'سرعت', 'انضباط', 'انرژی', 'تمرکز']

export default function Marquee() {
  const row = (key: string) => (
    <span key={key} aria-hidden={key === 'b'}>
      {WORDS.map((w) => (
        <span
          key={`${key}-${w}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3.2rem',
          }}
        >
          {w}
          <Flame size={18} strokeWidth={2.6} />
        </span>
      ))}
    </span>
  )

  return (
    <div className="if-marquee-wrap" aria-hidden>
      <div className="if-marquee">
        <div className="if-marquee-track">
          {row('a')}
          {row('b')}
        </div>
      </div>
    </div>
  )
}
