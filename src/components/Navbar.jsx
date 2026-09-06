import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useCart } from '../context/CartContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

const LINKS = [
  { to: '/about', label: 'STORY', homeHash: '#editorial' },
  { to: '/shop', label: 'COLLECTION' },
  { to: '/fragrance', label: 'FRAGRANCE' },
  { to: '/contact', label: 'CONTACT' },
]

export default function Navbar() {
  const { count } = useCart()
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    if (open) {
      gsap.fromTo(
        menu,
        { autoAlpha: 0, y: -12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduced ? 0 : 0.45,
          ease: 'power3.out',
        },
      )
      gsap.fromTo(
        menu.querySelectorAll('[data-menu-item]'),
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.06,
          duration: reduced ? 0 : 0.5,
          ease: 'power3.out',
          delay: 0.05,
        },
      )
    }
  }, [open, reduced])

  const lightOnDark = isHome && !scrolled && !open

  return (
    <header className="fixed inset-x-0 top-0 z-[80]">
      <div
        className={`flex w-full items-center justify-between gap-4 border-b px-6 py-3.5 transition-[background,border-color,box-shadow] duration-400 md:px-8 md:py-4 ${
          lightOnDark
            ? 'border-white/15 bg-white/10 text-[#F8F4EE] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl backdrop-saturate-150'
            : 'border-[#3E2E22]/10 bg-[#F8F4EE]/60 text-[#3E2E22] shadow-[0_8px_28px_rgba(62,46,34,0.06)] backdrop-blur-2xl backdrop-saturate-150'
        }`}
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center no-underline" aria-label="NIZALIAH home">
          <img
            src={lightOnDark ? '/images/logo-white.png' : '/images/logo-dark.png'}
            alt="NIZALIAH Perfume"
            className="h-9 w-auto object-contain md:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) =>
            link.homeHash && isHome ? (
              <a
                key={link.label}
                href={link.homeHash}
                className={`font-sans text-[10px] font-medium tracking-[0.28em] no-underline opacity-75 transition-opacity hover:opacity-100 ${
                  lightOnDark ? 'text-[#F8F4EE]' : 'text-[#3E2E22]'
                }`}
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `font-sans text-[10px] font-medium tracking-[0.28em] no-underline transition-opacity hover:opacity-100 ${
                    lightOnDark ? 'text-[#F8F4EE]' : 'text-[#3E2E22]'
                  } ${isActive ? 'opacity-100' : 'opacity-70'}`
                }
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-5">
          <NavLink
            to="/shop"
            className={`hidden font-sans text-[10px] font-medium tracking-[0.28em] no-underline opacity-80 hover:opacity-100 md:inline ${
              lightOnDark ? 'text-[#F8F4EE]' : 'text-[#3E2E22]'
            }`}
          >
            SHOP
          </NavLink>
          <NavLink
            to="/cart"
            className={`relative font-sans text-[10px] font-medium tracking-[0.28em] no-underline opacity-80 hover:opacity-100 ${
              lightOnDark ? 'text-[#F8F4EE]' : 'text-[#3E2E22]'
            }`}
            aria-label={`Cart, ${count} items`}
          >
            CART
            {count > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 font-sans text-[9px] text-[#3E2E22]">
                {count}
              </span>
            )}
          </NavLink>

          <button
            type="button"
            className={`relative z-[90] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden ${
              lightOnDark ? 'text-[#F8F4EE]' : 'text-[#3E2E22]'
            }`}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`block h-px w-5 bg-current transition-transform ${
                open ? 'translate-y-[3.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-px w-5 bg-current transition-opacity ${
                open ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-px w-5 bg-current transition-transform ${
                open ? '-translate-y-[3.5px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
        </div>
      </div>

      {open && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-[85] flex flex-col bg-[#F4DEDF]/92 px-8 pb-12 pt-28 backdrop-blur-2xl md:hidden"
          style={{ opacity: 0, WebkitBackdropFilter: 'blur(24px)' }}
        >
          <nav className="flex flex-col gap-6">
            {[
              { to: '/', label: 'HOME' },
              { to: '/about', label: 'STORY' },
              { to: '/shop', label: 'COLLECTION' },
              { to: '/fragrance', label: 'FRAGRANCE' },
              { to: '/contact', label: 'CONTACT' },
              { to: '/shop', label: 'SHOP' },
              { to: '/cart', label: 'CART' },
            ].map((item) => (
              <Link
                key={item.label}
                data-menu-item
                to={item.to}
                className="font-display text-4xl font-light tracking-wide text-[#3E2E22] no-underline"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
