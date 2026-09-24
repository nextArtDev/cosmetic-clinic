import type { Metadata } from 'next';
import Experience from './components/Experience';
import { vazirmatnV23 } from './fonts';
import { mockRepository } from './data';

// /v23 is a full port of https://jacques-cie.com/ — a dental and implantology
// clinic in Sainte-Foy, Québec — re-authored as the fictional Tehran clinic
// «کلینیک دندانپزشکی دکتر پارسا و همکاران» (فارسی، RTL).
//
// The route is self-contained: components/, lib/, data.ts and two route-local
// stylesheets all live under app/v23/, and the only global hook it emits is
// `html[data-v23-active]`. styles/jacques.module.css scopes every rule under
// the `.jc-root` wrapper, so the home page and every other route see the
// document exactly as they left it.
//
// The motion layer is transcribed from the reference's own bundle rather than
// approximated: the Lenis config, the hero's blur reveal and delta-driven
// overlay, the 130%-tall image parallax with its scrub, and the banner's
// breakpoint-dependent drift are all the reference's real numbers.
//
// Copy is original Persian mock content behind the `mockRepository` seam, so
// swapping in Prisma later touches one file.
export const metadata: Metadata = {
  title: { absolute: 'دکتر پارسا و همکاران | کلینیک دندانپزشکی و ایمپلنت در تهران' },
  description:
    'کلینیک دندانپزشکی و ایمپلنت دکتر پارسا و همکاران در تهران؛ درمان‌های شخصی‌سازی‌شده‌ی دندانپزشکی با تکیه بر فناوری پیشرفته، در فضایی آرام و حرفه‌ای.',
  robots: { index: false, follow: false },
};

export default async function V23Page() {
  const [home, navigation, settings, services] = await Promise.all([
    mockRepository.getHome(),
    mockRepository.getNavigation(),
    mockRepository.getSettings(),
    mockRepository.listServices(),
  ]);

  return (
    <div className={vazirmatnV23.variable}>
      <Experience
        home={home}
        navigation={navigation}
        settings={settings}
        services={services}
      />
    </div>
  );
}
