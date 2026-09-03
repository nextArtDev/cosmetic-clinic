'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  // SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
// import { ExtendedUserWithoutEmail } from '@/types/next-auth'
import { QuestionMarkIcon } from '@radix-ui/react-icons'
import {
  CalendarArrowDown,
  CalendarDays,
  ChartNoAxesCombined,
  Home,
  Hospital,
  IdCard,
  MessageSquare,
  SettingsIcon,
  Syringe,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'

type AppSidebarUser = {
  name?: string | null
  phone?: string | null
  role?: string | null
}

type AppSidebarProps = {
  user?: AppSidebarUser
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const routes = [
    {
      href: `/`,
      label: 'خانه',
      active: pathname === `/`,
      icon: Home,
    },
    {
      href: `/dashboard`,
      label: 'وضعیت',
      active: pathname === `/dashboard`,
      icon: ChartNoAxesCombined,
    },
    {
      href: `/dashboard/books`,
      label: 'نوبت‌ها',
      active: pathname === `/dashboard/books`,
      icon: CalendarArrowDown,
    },
    {
      href: `/dashboard/specialization`,
      label: 'تخصص‌ها',
      active: pathname === `/dashboard/specialization`,
      icon: Hospital,
    },
    {
      href: `/dashboard/doctors`,
      label: 'پزشکان',
      active: pathname === `/dashboard/doctors`,
      icon: IdCard,
    },
    {
      href: `/dashboard/personnels`,
      label: 'پرسنل',
      active: pathname === `/dashboard/personnels`,
      icon: Users,
    },
    {
      href: `/dashboard/illness`,
      label: 'بیماری',
      active: pathname === `/dashboard/illness`,
      icon: Syringe,
    },
    {
      href: `/dashboard/booking`,
      label: 'نوبت‌دهی',
      active: pathname === `/dashboard/booking`,
      icon: CalendarDays,
    },
    {
      href: `/dashboard/comments`,
      label: 'کامنت‌ها',
      active: pathname === `/dashboard/comments`,
      icon: MessageSquare,
    },
    {
      href: `/dashboard/faqs`,
      label: 'سوالات پرتکرار',
      active: pathname === `/dashboard/faqs`,
      icon: QuestionMarkIcon,
    },
    {
      href: `/dashboard/settings`,
      label: 'تنظیمات',
      active: pathname === `/dashboard/settings`,
      icon: SettingsIcon,
    },
  ]
  const {
    // state,
    // open,
    // setOpen,
    // openMobile,
    // setOpenMobile,
    // isMobile,
    toggleSidebar,
  } = useSidebar()
  return (
    <Sidebar variant="sidebar" side="right" className="w-52 h-full my-auto">
      <SidebarContent className="">
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu className="items-start mx-auto py-4 ">
              {routes.map((item) => (
                <SidebarMenuItem
                  onClick={toggleSidebar}
                  className={`py-2 w-full ${
                    item.active ? 'text-muted-foreground bg-muted' : ''
                  }`}
                  key={item.href}
                >
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={cn(' w-full flex items-center  gap-2.5 ')}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <Separator />
          <SidebarFooter className="py-4 pr-4 text-center">
            <div className="flex flex-col gap-y-1">
              {/* {user?.firstName} {user?.lastName} */}
              {user?.name}
              <span className="text-muted-foreground">
                {/* {user?.emailAddresses[0].emailAddress} */}
                {user?.phone}
              </span>
              <span className="">
                <Badge
                  variant="secondary"
                  className="capitalize  dark:bg-pink-700/30 dark:text-pink-700  bg-indigo-700/30 text-indigo-700 "
                >
                  {user?.role?.toString()?.toLocaleLowerCase()} Dashboard
                </Badge>
              </span>
            </div>
          </SidebarFooter>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
