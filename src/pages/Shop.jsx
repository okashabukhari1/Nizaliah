import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function Shop() {
  useDocumentTitle('NIZALIAH — The Collection')
  const rootRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !rootRef.current) return undefined
    const ctx = gsap.context(() => {
      gsap.from('[data-shop-head]', {
        y: 28,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
      })
      gsap.from('[data-shop-card]', {
        y: 40,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={rootRef} className="bg-[#F8F4EE] pt-28 text-[#3E2E22]">
      <section className="px-6 pb-10 md:pb-14">
        <div className="mx-auto max-w-6xl" data-shop-head>
          <p className="mb-4 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]">
            NIZALIAH
          </p>
          <h1 className="font-display text-[clamp(2.8rem,7vw,5rem)] font-light leading-[0.95]">
            THE COLLECTION
          </h1>
          <p className="mt-6 max-w-xl font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85">
            A collection of fragrances composed for presence, memory and
            movement.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {products.map((product) => (
            <div key={product.id} data-shop-card>
              <ProductCard product={product} tone="light" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
