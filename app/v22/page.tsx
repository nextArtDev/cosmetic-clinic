import type { Metadata } from 'next';
import Experience from './components/Experience';
import { golpayeganiV22, vazirmatnV22 } from './fonts';
import { aryasangRepository } from './data';

// /v22 is a full port of https://www.elitestone.it/ — a luxury natural-stone
// atelier — rebuilt as the fictional Iranian brand آریاسنگ (RTL, فارسی),
// following the proven /v7 → /v21 isolation pattern.
//
// Everything lives inside this route: components/, lib/ and two route-local
// stylesheets. elitestone.module.css scopes every rule under `.experience`;
// elitone.global.css emits only `html[data-v22-active]` rules, an attribute the
// shell sets while mounted and strips on unmount — so the home page and every
// other route are untouched.
//
// The motion layer is a transcription of the reference theme bundle: line-masked
// title/excerpt reveals, the scrubbing hero reel, the 135° product tile, the
// hover marquee, the fixed-attachment covers, the custom cursor and the
// clip-path preloader. Copy is original Persian mock content; the
// aryasangRepository seam is ready to be backed by Prisma later.
export const metadata: Metadata = {
  title: { absolute: 'آریاسنگ | سنگِ طبیعیِ لوکسِ ایران' },
  description:
    'آریاسنگ، شرکت ایرانیِ نمادِ سنگ‌های لوکس؛ متخصصِ تولید و فرآوریِ مرمر، اُنیکس و سنگ‌های طبیعیِ ایران برای پروژه‌های طراحیِ فوق‌لوکس.',
  robots: { index: false, follow: false },
};

export default async function V22Page() {
  const [posts, showrooms, products] = await Promise.all([
    aryasangRepository.listPosts(),
    aryasangRepository.listShowrooms(),
    aryasangRepository.listProducts(),
  ]);
  return (
    <div className={`${golpayeganiV22.variable} ${vazirmatnV22.variable}`}>
      <Experience posts={posts} showrooms={showrooms} products={products} />
    </div>
  );
}
