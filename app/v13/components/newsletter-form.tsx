'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/v13/api/khabarnameh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'home' }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setStatus('error')
        setMessage(data.error ?? 'یک چیزی خراب شد.')
        return
      }
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('اتصال برقرار نشد. دوباره تلاش کن.')
    }
  }

  return (
    <div className="mailing_embed-2">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.p
            key="ok"
            className="ml-success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            سپاس. نامه‌ات در بطری، سرِ وقتش به مقصد می‌رسد.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            className="ml-form"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            noValidate
          >
            <div className="ml-form-row">
              <label htmlFor="v13-newsletter-email" className="sr-only">
                نشانی ایمیل
              </label>
              <input
                id="v13-newsletter-email"
                className="ml-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <motion.button
                type="submit"
                className="ml-submit"
                disabled={status === 'loading'}
                whileTap={{ scale: 0.97 }}
              >
                {status === 'loading' ? 'در حال ثبت…' : 'عضویت'}
              </motion.button>
            </div>
            <AnimatePresence>
              {status === 'error' && (
                <motion.p
                  key="err"
                  className="ml-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
            <p className="ml-note">هیچ اسپمی در کار نیست. هر وقت خواستی، با یک کلیک لغو عضویت.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
