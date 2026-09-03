import { CinematicFooterServer } from '@/components/Home/CinematicFooterServer'
import { HomeShell } from '@/components/Home/HomeShell'
import { ChatWidget } from '@/components/Home/chat/chat-widget'

// Global shell for the public frontend: every page gets the cinematic
// footer. The floating AppNavbar is NOT rendered here — routes that use it
// opt in via the (chrome) route group, so pages like /user that provide
// their own header don't end up with a double navbar.
export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="relative min-h-screen">
      <div className=" ">
        <HomeShell>
          {children}
          <CinematicFooterServer />
          <ChatWidget />
        </HomeShell>
      </div>
    </main>
  )
}
