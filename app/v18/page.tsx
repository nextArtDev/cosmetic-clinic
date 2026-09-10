import type { Metadata } from 'next';
import MeliusExperience from './MeliusExperience';

// /v18 is a port of the Persian "Melius" (ملیوس) creative-AI frontend from
// C:\Users\aria\Desktop\chat-clone\melus-v2 (src/app/melius +
// src/features/melius), a Persian adaptation of https://www.melius.com/,
// following the proven /v7 → /v17 isolation pattern. All UI lives inside this
// route's directory; the experience styles itself exclusively through hashed
// CSS-Module classes scoped to its own .root wrapper (its custom props are
// declared there, never on :root), so the home page and every other route are
// untouched. Tests (tests/melius.smoke.mjs) were intentionally not ported.
export const metadata: Metadata = {
  title: { absolute: 'ملیوس — هر آنچه تصور می‌کنی، خلق کن | v18 demo' },
  description:
    'استودیوی خلاقیت هوش مصنوعی؛ از اولین ایده تا تصویر، ویدیو و صدای نهایی. نسخه نمایشی فارسی ملیوس.',
  robots: { index: false, follow: false },
};

export default function V18Page() {
  return <MeliusExperience />;
}
