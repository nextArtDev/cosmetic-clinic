import { SidebarTrigger } from '@/components/ui/sidebar'

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="pt-10 w-full mx-1.5 ">
      <SidebarTrigger className=" " />
      {children}
    </section>
  )
}
