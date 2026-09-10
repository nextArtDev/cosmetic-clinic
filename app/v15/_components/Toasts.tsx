'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useV15 } from '../_lib/store'
import { V15_EASE } from './Preloader'

/** Bottom-center toast stack — confirmations for mock actions. */
export default function Toasts() {
  const { toasts } = useV15()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[110] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.5, ease: V15_EASE }}
            className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-full bg-[color:var(--v15-ink)] py-3 pl-6 pr-3 text-[color:var(--v15-paper)] shadow-xl shadow-black/20"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--v15-caramel)]">
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="flex flex-col text-right">
              <span className="text-sm font-normal leading-6">{t.title}</span>
              {t.desc && (
                <span className="text-[11px] font-light opacity-60">{t.desc}</span>
              )}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}