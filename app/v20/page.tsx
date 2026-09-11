import type { Metadata } from 'next';
import Landing from './components/Landing';
import { getIranfitContent } from './data';

// /v20 is a port of the Persian "IRANFIT" (ایرون‌فیت) fitness frontend from
// C:\Users\aria\Desktop\chat-clone\atumobile (src/app/iranfit), a Persian
// fitness concept inspired by the art direction of https://www.atumobile.com/,
// following the proven /v7 → /v19 isolation pattern. All UI lives inside this
// route's directory; iranfit.css scopes every rule under `.iranfit-root`, so
// the home page and every other route are untouched. All copy is original
// Persian mock content.
export const metadata: Metadata = {
  title: { absolute: 'ایرون‌فیت | باشگاه همراه تو | v20 demo' },
  description:
    'برنامه تمرینی و تغذیه هوشمند فارسی — در خانه یا باشگاه، با ویدیوهای تمرینی، برنامه غذایی ایرانی و مربی همیشه‌همراه.',
  robots: { index: false, follow: false },
};

export default async function V20Page() {
  const content = await getIranfitContent();
  return <Landing content={content} />;
}
