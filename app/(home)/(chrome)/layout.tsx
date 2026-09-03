import { AppNavbar } from '@/components/Home/navbar/index'

// Route group for pages that use the floating pill navbar. Lives inside the
// (home) layout, so these pages still get the global CinematicFooter.
//
// force-dynamic: several pages here (faq, booking, appointments) read live
// database data. Skip static prerendering — the database only exists at
// runtime on the server, so a build-time prerender would fail.
export const dynamic = 'force-dynamic'

export default function ChromeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AppNavbar />
      {children}
    </>
  )
}
