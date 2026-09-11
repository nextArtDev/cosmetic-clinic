import type { Metadata } from 'next';
import FlowersExperience from './_components/FlowersExperience';
import { getCatalog } from './_lib/catalog';

// /v19 is a port of the Persian "گل / سیم" (Flowers Sim) monobouquet shop
// frontend from C:\Users\aria\Desktop\chat-clone\flower (src/app/flowers),
// itself a Persian recreation of https://flowers-sim.ru/, following the
// proven /v7 → /v18 isolation pattern. All UI lives inside this route's
// directory; the experience styles itself exclusively through hashed
// CSS-Module classes scoped to its own .experience wrapper (its custom props
// and @font-face are declared there, never on :root), so the home page and
// every other route are untouched.
export const metadata: Metadata = {
  title: { absolute: 'گل / سیم — زیبایی، بی‌بهانه | v19 demo' },
  description:
    'استودیو گل سیم؛ گل‌هایی برای خانه، برای یک عزیز، برای زیبایی بی‌بهانه. طراحی و ارسال گل در تهران. نسخه نمایشی.',
  robots: { index: false, follow: false },
};

export default async function V19Page() {
  const catalog = await getCatalog();
  return <FlowersExperience products={catalog} />;
}
