import Link from 'next/link'

export default function V10NotFound() {
  return (
    <main className="v10-notfound">
      <p className="mono">۴۰۴ · صفحه پیدا نشد</p>
      <h1>این صفحه دیگر آن‌جا نیست که بود.</h1>
      <p>
        شاید نشانی را اشتباه آمده‌اید یا صفحه جابه‌جا شده است. از این‌جا ادامه دهید:
      </p>
      <Link href="/v10" className="action">
        <span className="button-label">
          <span>بازگشت به صفحهٔ اصلی</span>
          <span aria-hidden="true">بازگشت به صفحهٔ اصلی</span>
        </span>
      </Link>
    </main>
  )
}
