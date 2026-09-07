'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { type CartItem } from '../lib/content'

export type DialogName = 'cart' | 'checkout' | 'contact' | 'account' | 'guarantee' | null

type CartContextValue = {
  items: CartItem[]
  ready: boolean
  saving: boolean
  error: string
  setError: (message: string) => void
  dialog: DialogName
  setDialog: (dialog: DialogName) => void
  add: (productId: string, subscription: boolean) => void
  changeQuantity: (productId: string, subscription: boolean, delta: number) => void
  remove: (productId: string, subscription: boolean) => void
  clearAfterOrder: () => void
  retry: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

/**
 * Same contract as the nervana cart provider, but the backend is the
 * /v10/api mock (no Prisma) — swap the fetch targets when v10 goes live.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<DialogName>(null)
  const current = useRef<CartItem[]>([])
  const saved = useRef<CartItem[]>([])
  const pending = useRef(0)
  const queue = useRef<Promise<void>>(Promise.resolve())

  const loadItems = useCallback(async (): Promise<CartItem[] | null> => {
    setError('')
    try {
      const response = await fetch('/v10/api/cart', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      current.current = data.items
      saved.current = data.items
      return data.items as CartItem[]
    } catch {
      setError('سبد شما بارگذاری نشد؛ دوباره تلاش کنید.')
      return null
    } finally {
      setReady(true)
    }
  }, [])

  const retry = useCallback(() => { void loadItems().then((items) => { if (items) setItems(items) }) }, [loadItems])

  useEffect(() => {
    let active = true
    void (async () => {
      const items = await loadItems()
      if (active && items) setItems(items)
    })()
    return () => { active = false }
  }, [loadItems])

  function persist(next: CartItem[]) {
    current.current = next
    setItems(next)
    setError('')
    setSaving(true)
    pending.current += 1
    queue.current = queue.current.catch(() => {}).then(async () => {
      try {
        const response = await fetch('/v10/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: next }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        saved.current = data.items
      } catch {
        setError('تغییرات شما ذخیره نشد؛ دوباره تلاش کنید.')
        if (current.current === next) { current.current = saved.current; setItems(saved.current) }
      } finally {
        pending.current -= 1
        if (pending.current === 0) setSaving(false)
      }
    })
  }

  function add(productId: string, subscription: boolean) {
    const existing = current.current.find((item) => item.productId === productId && item.subscription === subscription)
    if (existing && existing.quantity >= 20) { setError('از هر خدمت حداکثر ۲۰ مورد می‌توانید رزرو کنید.'); setDialog('cart'); return }
    persist(existing
      ? current.current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current.current, { productId, subscription, quantity: 1 }])
    setDialog('cart')
  }

  function changeQuantity(productId: string, subscription: boolean, delta: number) {
    persist(current.current
      .map((item) => item.productId === productId && item.subscription === subscription
        ? { ...item, quantity: Math.min(20, item.quantity + delta) }
        : item)
      .filter((item) => item.quantity > 0))
  }

  function remove(productId: string, subscription: boolean) {
    persist(current.current.filter((item) => !(item.productId === productId && item.subscription === subscription)))
  }

  function clearAfterOrder() { current.current = []; saved.current = []; setItems([]); setError('') }

  return (
    <CartContext.Provider value={{ items, ready, saving, error, setError, dialog, setDialog, add, changeQuantity, remove, clearAfterOrder, retry }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
