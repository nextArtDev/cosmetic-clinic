'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const KEY = 'v13-cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) {
        const t = window.setTimeout(() => setVisible(true), 1800)
        return () => window.clearTimeout(t)
      }
    } catch {
      /* private mode */
    }
  }, [])

  function choose(value: 'allow' | 'deny') {
    try {
      window.localStorage.setItem(KEY, value)
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fs-cc-banner2_component"
          data-cookie-banner
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-live="polite"
          aria-label="درباره کوکی‌ها"
        >
          <div className="fs-cc-banner2_container" data-cookie-container>
            <div className="fs-cc-banner2_text" data-cookie-text>
              این سایت از کوکی استفاده می‌کند
            </div>
            <div className="fs-cc-banner2_buttons-wrapper">
              <button
                type="button"
                className="fs-cc-banner2_button fs-cc-button-alt"
                data-cookie-alt
                onClick={() => choose('deny')}
              >
                رد می‌کنم
              </button>
              <button
                type="button"
                className="fs-cc-banner2_button"
                data-cookie-allow
                onClick={() => choose('allow')}
              >
                قبول می‌کنم
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
