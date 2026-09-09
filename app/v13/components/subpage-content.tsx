'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import NewsletterForm from './newsletter-form'
import { useTransitionNavigate } from './page-transition'
import { LINKS } from '../lib/assets'

type Props = {
  title: string
  lead: string
  body: string
  accent: string
  text: string
  showNewsletter?: boolean
}

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Port of the original SubpageContent. The original leaned on Tailwind
 * utility classes; /v13 ships no Tailwind build, so the utilities are
 * expressed as scoped .v13-sub* rules in v13/globals.css instead.
 */
export default function SubpageContent({
  title,
  lead,
  body,
  accent,
  text,
  showNewsletter,
}: Props) {
  const navigate = useTransitionNavigate()
  return (
    <main className="v13-sub-main" style={{ color: text }}>
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease }}
        className="v13-sub-title"
        style={{ color: accent }}
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease, delay: 0.15 }}
        className="v13-sub-lead paragraph-bigger"
        style={{ color: text }}
      >
        {lead}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease, delay: 0.3 }}
        className="v13-sub-body"
        style={{ color: text }}
      >
        {body}
      </motion.p>

      {showNewsletter && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease, delay: 0.45 }}
          className="v13-sub-form"
          style={{ ['--text-yellow' as string]: accent }}
        >
          <NewsletterForm />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="v13-sub-actions"
        style={{ color: text }}
      >
        <a
          href={LINKS.booking}
          onClick={(e) => navigate(e, LINKS.booking)}
          className="v13-sub-cta"
          style={{ backgroundColor: accent, color: '#faf0d0' }}
        >
          رزرو جلسه
        </a>
        <Link
          href="/v13"
          onClick={(e) => navigate(e, '/v13')}
          className="v13-sub-back"
          style={{ color: text }}
        >
          → بازگشت به صفحه‌ی اصلی
        </Link>
      </motion.div>
    </main>
  )
}
