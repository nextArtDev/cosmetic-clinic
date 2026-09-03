import { AppNavbar } from '@/components/Home/navbar/index'

// Route group for pages that use the floating pill navbar. Lives inside the
// (home) layout, so these pages still get the global CinematicFooter.
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
