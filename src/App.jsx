import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import IntroLoader from './components/IntroLoader'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import About from './pages/About'
import Fragrance from './pages/Fragrance'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import { CartProvider } from './context/CartContext'
import { useLenis } from './hooks/useLenis'
import { useReducedMotion } from './hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

function RouteEffects() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (pathname !== '/') {
      window.scrollTo(0, 0)
    }

    const id = window.setTimeout(() => {
      if (hash) {
        const el = document.getElementById(hash.replace('#', ''))
        el?.scrollIntoView({ behavior: 'smooth' })
      }
      ScrollTrigger.refresh()
    }, pathname === '/' ? 120 : 40)

    return () => window.clearTimeout(id)
  }, [pathname, hash])

  return null
}

function AppShell() {
  const reducedMotion = useReducedMotion()
  useLenis(!reducedMotion)

  return (
    <CartProvider>
      <IntroLoader />
      <Navbar />
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/about" element={<About />} />
        <Route path="/fragrance" element={<Fragrance />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      <Footer />
    </CartProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
