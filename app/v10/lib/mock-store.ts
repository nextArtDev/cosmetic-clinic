/**
 * /v10 mock store — single in-memory store per server process, shared by
 * the cart and order API routes (same pattern as the nervana drizzle db,
 * minus persistence). When v10 goes live, delete this module and give the
 * routes a real Prisma client.
 */

export type MockCartItem = { productId: string; quantity: number; subscription: boolean }
export type MockOrder = {
  reference: string
  email: string
  name: string
  phone: string
  city: string
  postalCode: string
  items: (MockCartItem & { name: string; variant: string; price: number })[]
  total: number
  status: 'demo'
  createdAt: string
}

const globalForV10 = globalThis as typeof globalThis & {
  __v10Carts?: Map<string, { items: MockCartItem[]; updatedAt: number }>
  __v10Orders?: Map<string, MockOrder>
  __v10Messages?: { name: string; email: string; message: string; subscribe: boolean; createdAt: string }[]
}

export const mockCarts = (globalForV10.__v10Carts ??= new Map())
export const mockOrders = (globalForV10.__v10Orders ??= new Map())
export const mockMessages = (globalForV10.__v10Messages ??= [])
