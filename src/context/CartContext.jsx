import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getProductBySlug } from '../data/products'

const STORAGE_KEY = 'nizaliah-cart-v1'
const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() =>
    typeof window !== 'undefined' ? loadCart() : [],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((slug, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === slug)
      if (existing) {
        return prev.map((i) =>
          i.slug === slug ? { ...i, quantity: i.quantity + qty } : i,
        )
      }
      return [...prev, { slug, quantity: qty }]
    })
  }, [])

  const removeItem = useCallback((slug) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug))
  }, [])

  const setQuantity = useCallback((slug, quantity) => {
    const q = Math.max(0, Math.floor(quantity))
    setItems((prev) => {
      if (q <= 0) return prev.filter((i) => i.slug !== slug)
      return prev.map((i) => (i.slug === slug ? { ...i, quantity: q } : i))
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const detailedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = getProductBySlug(item.slug)
          if (!product) return null
          return {
            ...item,
            product,
            lineTotal: product.price * item.quantity,
          }
        })
        .filter(Boolean),
    [items],
  )

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () => detailedItems.reduce((sum, i) => sum + i.lineTotal, 0),
    [detailedItems],
  )

  const value = useMemo(
    () => ({
      items,
      detailedItems,
      count,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    }),
    [
      items,
      detailedItems,
      count,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
