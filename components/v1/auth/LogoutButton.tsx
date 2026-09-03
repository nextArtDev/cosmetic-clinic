'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { signOut } from '@/lib/auth-client'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    if (loading) return
    setLoading(true)
    try {
      await signOut()
      toast.success('از حساب خود خارج شدید.')
      router.push('/v1')
      router.refresh()
    } catch {
      toast.error('خطا در خروج از حساب.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <LogOut size={15} />
      )}
      خروج
    </button>
  )
}
