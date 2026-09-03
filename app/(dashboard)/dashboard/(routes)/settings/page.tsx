import { getAppSettings } from '@/lib/actions/dashboard/settings/get-app-settings'
import AppSettingsForm from './components/AppSettingsForm'
import AdminUsersTable from './components/AdminUsersTable'

export default async function SettingsPage() {
  const appSettings = await getAppSettings()

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="space-y-2 text-center md:text-right">
        <h1 className="text-3xl font-bold tracking-tight">تنظیمات</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          تنظیمات سراسری اپ و مدیریت دسترسی کاربران
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">تنظیمات اپ</h2>
        <AppSettingsForm initialValues={appSettings} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">مدیریت دسترسی کاربران</h2>
        <AdminUsersTable />
      </section>
    </main>
  )
}
