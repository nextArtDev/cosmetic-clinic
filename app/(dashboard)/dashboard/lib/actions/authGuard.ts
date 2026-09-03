'server-only'

import { currentUser } from '@/lib/auth'

export const adminGuard = async () => {
  const user = await currentUser()
  if (!user || !user || user.role !== 'admin') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
}
