'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getUsers } from '@/lib/actions/dashboard/settings/get-users'
import { setUserRole } from '@/lib/actions/dashboard/settings/set-user-role'

const roleOptions = ['user', 'admin', 'doctor'] as const
type Role = (typeof roleOptions)[number]

type UserRow = {
  id: string
  name: string | null
  email: string
  phoneNumber: string | null
  role: Role
  isRootAdmin: boolean | null
  isActive: boolean
}

export default function AdminUsersTable() {
  const [pending, startTransition] = useTransition()
  const [users, setUsers] = useState<UserRow[]>([])
  const [filter, setFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    const res = await getUsers()
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    setUsers(res.users)
  }

  useEffect(() => {
    // Avoid calling setState synchronously in an effect body.
    void (async () => {
      await load()
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return users

    return users.filter((u) => {
      return (
        (u.name ?? '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber ?? '').toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
    })
  }, [filter, users])

  const handleSetRole = (u: UserRow, role: Role) => {
    startTransition(async () => {
      setUpdatingId(u.id)

      const res = await setUserRole({
        userId: u.id,
        role,
        isRootAdmin: role === 'admin',
      })

      setUpdatingId(null)

      if (!res.ok) {
        toast.error(res.error)
        return
      }

      toast.success('نقش کاربر به‌روزرسانی شد.')
      await load()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>کاربران و نقش‌ها</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="جستجو با نام/ایمیل/موبایل/نقش..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button variant="outline" onClick={() => load()} disabled={pending}>
            {pending ? '...' : 'بروزرسانی'}
          </Button>
        </div>

        <div className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>موبایل</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>Root Admin</TableHead>
                <TableHead className="text-left">اقدام‌ها</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="whitespace-nowrap">
                    {u.name ?? '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{u.email}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {u.phoneNumber ?? '-'}
                  </TableCell>

                  <TableCell>
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={u.role}
                      disabled={pending || updatingId === u.id}
                      onChange={(e) => {
                        handleSetRole(u, e.target.value as Role)
                      }}
                    >
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </TableCell>

                  <TableCell>{u.isRootAdmin ? 'بله' : 'خیر'}</TableCell>

                  <TableCell className="text-left">
                    <Button
                      size="sm"
                      disabled={
                        pending || updatingId === u.id || u.role === 'admin'
                      }
                      onClick={() => handleSetRole(u, 'admin')}
                      className="mr-2"
                    >
                      Make Admin
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        pending || updatingId === u.id || u.role === 'user'
                      }
                      onClick={() => handleSetRole(u, 'user')}
                    >
                      Set User
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    موردی یافت نشد.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          توجه: دسترسی این صفحه توسط گیت dashboard محدود شده است (فقط admin).
        </p>
      </CardContent>
    </Card>
  )
}
