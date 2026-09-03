import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, phoneNumber } from 'better-auth/plugins'
import prisma from './prisma'
import { nextCookies } from 'better-auth/next-js'
import { headers } from 'next/headers'
import { cache } from 'react'
import { sendOtpSms } from './sms'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: false, // phone-only login
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        input: false, // user cannot set their own role
      },
      phoneNumber: {
        type: 'string',
        input: false,
      },
    },
  },
  plugins: [
    admin(),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, request) => {
        if (!code || !phoneNumber) {
          throw new Error('کد تأیید ارسال نشد. لطفاً دوباره تلاش کنید.')
        }

        // 3-minute cooldown per phone number to prevent SMS spam
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)
        const existingRequest = await prisma.otpRateLimit.findUnique({
          where: { phoneNumber },
        })

        if (existingRequest && existingRequest.lastSentAt > threeMinutesAgo) {
          const timeLeft = Math.ceil(
            (existingRequest.lastSentAt.getTime() +
              3 * 60 * 1000 -
              Date.now()) /
              1000,
          )
          throw new Error(
            `لطفاً ${timeLeft} ثانیه دیگر برای دریافت کد جدید صبر کنید.`,
          )
        }
        console.log(phoneNumber, code)
        const result = await sendOtpSms(phoneNumber, code)

        if (!result.ok) {
          // Record the attempt so a failing provider still rate-limits retries
          await prisma.otpRateLimit.upsert({
            where: { phoneNumber },
            update: { lastSentAt: new Date() },
            create: { phoneNumber, lastSentAt: new Date() },
          })
          throw new Error(
            'ارسال پیامک با مشکل مواجه شد. لطفاً دوباره تلاش کنید.',
          )
        }

        await prisma.otpRateLimit.upsert({
          where: { phoneNumber },
          update: { lastSentAt: new Date() },
          create: { phoneNumber, lastSentAt: new Date() },
        })
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@clinic.local`
        },
        getTempName: (phoneNumber) => {
          return phoneNumber
        },
      },
      callbackOnVerification: async ({ phoneNumber, user }, request) => {
        // no-op
      },
    }),
    nextCookies(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 60, // 60 days
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user

export const currentUser = cache(async () => {
  'use server'
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
    },
  })

  return user
})
