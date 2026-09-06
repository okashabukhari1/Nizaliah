import { useEffect, useRef, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import gsap from 'gsap'
import FragranceNotes from '../components/FragranceNotes'
import ProductCard from '../components/ProductCard'
import {
  getProductBySlug,
  getRelatedProducts,
  formatPrice,
} from '../data/products'
import { useCart } from '../context/CartContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function ProductPage() {
  const { slug } = useParams()
  const product = getProductBySlug(slug)
  const related = getRelatedProducts(slug, 3)
  const { addItem } = useCart()
  const reduced = useReducedMotion()
  const heroRef = useRef(null)
  const bottleRef = useRef(null)
  const revealRoot = useScrollReveal()
  const [added, setAdded] = useState(false)

  useDocumentTitle(
    product
      ? `NIZALIAH — ${product.name} Eau de Parfum`
      : 'NIZALIAH — Fragrance',
  )

  useEffect(() => {
    if (!product || reduced || !heroRef.current) return undefined
    const ctx = gsap.context(() => {
      gsap.from('[data-pd-copy]', {
        y: 24,
        autoAlpha: 0,
        duration: 0.95,
        stagger: 0.08,
        ease: 'power3.out',
      })
      gsap.from(bottleRef.current, {
        scale: 0.94,
        autoAlpha: 0,
        duration: 1.15,
        ease: 'power3.out',
      })
    }, heroRef)
    return () => ctx.revert()
  }, [product, reduced, slug])

  useEffect(() => {
    if (!product?.primary || reduced || !bottleRef.current) return undefined
    const el = bottleRef.current
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      gsap.to(el, {
        rotateY: x * 6,
        rotateX: -y * 4,
        duration: 0.6,
        ease: 'power2.out',
        transformPerspective: 800,
      })
    }
    const onLeave = () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' })
    }
    const area = heroRef.current
    area?.addEventListener('mousemove', onMove)
    area?.addEventListener('mouseleave', onLeave)
    return () => {
      area?.removeEventListener('mousemove', onMove)
      area?.removeEventListener('mouseleave', onLeave)
    }
  }, [product, reduced])

  if (!product) return <Navigate to="/shop" replace />

  const onAdd = () => {
    addItem(product.slug, 1)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div ref={revealRoot} className="bg-[#F8F4EE] text-[#3E2E22]">
      <section
        ref={heroRef}
        className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-28 md:grid-cols-2 md:gap-16 md:pb-24 md:pt-32"
      >
        <div
          className={`flex aspect-[3/4] items-center justify-center border border-[#3E2E22]/12 px-8 ${
            product.primary ? 'bg-[#221C16]' : 'bg-[#F4DEDF]'
          }`}
        >
          <img
            ref={bottleRef}
            src={product.image}
            alt={product.name}
            className="max-h-[85%] object-contain"
            style={
              product.primary ? { mixBlendMode: 'screen' } : undefined
            }
          />
        </div>

        <div className="flex flex-col justify-center">
          <p
            data-pd-copy
            className="mb-3 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]"
          >
            {product.category.toUpperCase()}
          </p>
          <h1
            data-pd-copy
            className="font-display text-[clamp(2.6rem,6vw,4.5rem)] font-light leading-[0.95]"
          >
            {product.name}
          </h1>
          <p
            data-pd-copy
            className="mt-3 font-sans text-[10px] tracking-[0.3em] text-[#7B5E3B]"
          >
            {product.type.toUpperCase()}
          </p>
          <p data-pd-copy className="mt-6 font-display text-3xl font-light">
            {formatPrice(product)}
          </p>
          <p
            data-pd-copy
            className="mt-6 max-w-md font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85"
          >
            {product.description}
          </p>
          <p
            data-pd-copy
            className="mt-4 font-sans text-xs tracking-wide text-[#7B5E3B]"
          >
            {product.character}
          </p>

          <div data-pd-copy className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onAdd}
              className="border border-[#3E2E22] bg-[#3E2E22] px-8 py-3 font-sans text-[10px] tracking-[0.32em] text-[#F8F4EE] transition-colors hover:bg-transparent hover:text-[#3E2E22]"
            >
              {added ? 'ADDED TO BAG' : 'ADD TO BAG'}
            </button>
            <Link
              to="/cart"
              className="font-sans text-[10px] tracking-[0.28em] text-[#7B5E3B] no-underline"
            >
              VIEW BAG →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[#3E2E22]/10 bg-[#F4DEDF] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p
            data-reveal
            className="mb-3 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]"
          >
            FRAGRANCE STORY
          </p>
          <h2
            data-reveal
            className="max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight"
          >
            {product.shortDescription}
          </h2>
          <div className="mt-14">
            <FragranceNotes notes={product.notes} tone="light" />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          {[
            { label: 'CHARACTER', value: product.character },
            { label: 'INTENSITY', value: product.intensity },
            { label: 'LONGEVITY', value: product.longevity },
          ].map((item) => (
            <div
              key={item.label}
              data-reveal
              className="border-t border-[#D4AF37]/50 pt-5"
            >
              <p className="font-sans text-[10px] tracking-[0.3em] text-[#7B5E3B]">
                {item.label}
              </p>
              <p className="mt-3 font-display text-2xl font-light">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <p
          data-reveal
          className="mx-auto mt-12 max-w-6xl font-sans text-sm font-light text-[#3E2E22]/75"
        >
          Size {product.size} · Eau de Parfum · Composed by NIZALIAH
        </p>
      </section>

      <section className="border-t border-[#3E2E22]/10 bg-[#E8DCCB]/40 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2
              data-reveal
              className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light"
            >
              Related fragrances
            </h2>
            <Link
              to="/shop"
              className="font-sans text-[10px] tracking-[0.28em] text-[#7B5E3B] no-underline"
            >
              ALL →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {related.map((p) => (
              <div key={p.id} data-reveal>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
