import type { Metadata } from 'next';
import Experience from './components/Experience';
import { sepidarFont } from './fonts';

// /v24 is a faithful port of https://numa.uprock.pro/ — a builder-generated
// (Taptop) landing page for a smart insulin pump — re-authored as the fictional
// «کلینیک دندانپزشکی سپیدار» in Tehran (فارسی، RTL).
//
// Everything the route owns lives under app/v24/; media is mirrored into
// public/v24/. styles/numa.vendor.css is the reference's own CSS with every
// selector prefixed by `#v24-root`, and the only document-level hook the route
// emits is `html[data-v24-active]`, which is set on mount and *restored* on
// unmount. The production home page and every other route see the document
// exactly as they left it.
//
// The home page is the port itself, so it renders the reference's own copy
// (translated to Persian) and takes no data. The mock repository seam is
// exercised by the sub-routes under /v24/services, which are the "important
// routes" that a real backend will eventually feed.
export const metadata: Metadata = {
  title: { absolute: 'کلینیک دندانپزشکی سپیدار | لبخندی سالم، با خیال آسوده' },
  description:
    'کلینیک دندانپزشکی سپیدار در تهران؛ ایمپلنت، ارتودنسی، طرح لبخند و درمان ریشه با مراقبت دقیق و انسانی.',
  robots: { index: false, follow: false },
};

export default function V24Page() {
  return (
    <div className={sepidarFont.variable}>
      <Experience />
    </div>
  );
}
