import { createAuthClient } from 'better-auth/react'
import {
  inferAdditionalFields,
  adminClient,
  phoneNumberClient,
} from 'better-auth/client/plugins'
import { nextCookies } from 'better-auth/next-js'
import { auth } from './auth'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    phoneNumberClient(),
    nextCookies(),
  ],
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
