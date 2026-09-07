import Link from 'next/link'

// Scoped /v9 404: rendered inside v9 layout/shell, .v9 classes only.
export default function V9NotFound() {
  return (
    <main className="not-found" id="main-content">
      <p className="eyebrow">صفحه پیدا نشد</p>
      <h1>مسیر تازه‌ای پیدا کنیم؟</h1>
      <p>این نشانی در دسترس نیست. مراقبت ما از همین‌جا ادامه دارد.</p>
      <Link className="outline-button" href="/v9">
        بازگشت به صفحه اصلی ↗
      </Link>
    </main>
  )
}
