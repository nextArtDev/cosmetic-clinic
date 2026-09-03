import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { currentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  if (!user || user.role !== 'admin') return notFound()
  return (
    <section className=" bg-background mx-auto w-full min-h-screen ">
      {/* <Navbar /> */}
      <SidebarProvider>
        <AppSidebar user={user} />
        {children}
      </SidebarProvider>
    </section>
  )
}
