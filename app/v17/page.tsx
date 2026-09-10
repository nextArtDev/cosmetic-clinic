import type { Metadata } from 'next'
import PrivyExperience from './PrivyExperience'

// /v17 is a byte-exact port of the "Privy" Persian Sobha-Privy-Collection
// frontend (chat-clone/sobha-privy-collection, concept of
// https://sobha-privy-collection.com/) following the proven /v7 → /v15
// isolation pattern. All UI lives inside this route's directory; the
// experience styles itself exclusively through hashed CSS-Module classes
// scoped to its own .experience wrapper, so the home page and every other
// route are untouched.
export const metadata: Metadata = {
  title: { absolute: 'پریوی | هنر بی‌همتا زیستن | v17 demo' },
  description:
    'مجموعه‌ای دست‌چین از خانه‌های بی‌همتا در الهیه، لواسان و سواحل خزر. تجربه‌ای ایرانی از هنر زندگی ممتاز. نسخه‌ی نمایشی.',
  robots: { index: false, follow: false },
}

export default function V17Page() {
  return <PrivyExperience />
}
