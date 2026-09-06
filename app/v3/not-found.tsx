import Link from 'next/link'

// ۴۰۴ اسکوپ‌شده برای زیردرخت /v3: داخل app/v3/layout.tsx رندر می‌شود (با
// همان شل و استایل‌های .v3) و به not-found کل اپ هیچ ربطی ندارد.
export default function V3NotFound() {
  return <main id="v3-main-content" className="not-found"><p className="eyebrow">۴۰۴ — خارج از کادر</p><h1>یک انحراف کوچک.<br />و یک مسیر <em>جدید.</em></h1><p>این صفحه وجود ندارد، اما چیزهای خوبی در کلینیک منتظر شماست.</p><Link href="/v3" className="arrow-link">بازگشت به صفحه اصلی <span aria-hidden="true">←</span></Link></main>
}
