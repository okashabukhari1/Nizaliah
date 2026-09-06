import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useScrollReveal } from '../hooks/useScrollReveal'

gsap.registerPlugin(ScrollTrigger)

export default function Fragrance() {
  useDocumentTitle('NIZALIAH — Fragrance')
  const root = useScrollReveal()
  const parallaxRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const rootEl = root.current
    if (reduced || !parallaxRef.current || !rootEl) return undefined
    const ctx = gsap.context(() => {
      gsap.to('[data-para]', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
      gsap.from('[data-note-row]', {
        x: (i) => (i % 2 === 0 ? -40 : 40),
        autoAlpha: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#note-structure',
          start: 'top 75%',
        },
      })
    }, rootEl)
    return () => ctx.revert()
  }, [reduced, root])

  return (
    <div ref={root} className="bg-[#F8F4EE] text-[#3E2E22]">
      <section className="px-6 pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <p
            data-reveal
            className="mb-4 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]"
          >
            THE FRAGRANCE HOUSE
          </p>
          <h1
            data-reveal
            className="max-w-3xl font-display text-[clamp(2.8rem,7vw,5.5rem)] font-light leading-[0.92]"
          >
            The language of scent
          </h1>
          <p
            data-reveal
            className="mt-8 max-w-xl font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85"
          >
            Every NIZALIAH fragrance is built as a three-act composition — top,
            heart, and base — written for presence rather than volume.
          </p>
        </div>
      </section>

      <section
        ref={parallaxRef}
        className="relative overflow-hidden bg-[#F4DEDF] px-6 py-24 md:py-32"
      >
        <div
          data-para
          className="pointer-events-none absolute -right-10 top-10 hidden h-72 w-56 border border-[#3E2E22]/15 bg-[#E8DCCB]/50 md:block"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <h2
            data-reveal
            className="max-w-2xl font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-tight"
          >
            Scent is how a moment becomes memory.
          </h2>
          <p
            data-reveal
            className="mt-6 max-w-lg font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85"
          >
            We compose for the space between arrival and lingering — the first
            impression, the character that settles, the trail that remains.
          </p>
        </div>
      </section>

      <section id="note-structure" className="px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl space-y-16">
          {[
            {
              label: 'TOP NOTES',
              title: 'The opening breath',
              body: 'Citrus, spice, and light florals — bright, brief, and inviting.',
            },
            {
              label: 'HEART NOTES',
              title: 'The character',
              body: 'Where the fragrance finds its identity — woods, florals, resins.',
            },
            {
              label: 'BASE NOTES',
              title: 'The memory',
              body: 'Musks, ambers, and deep woods — the quiet that stays.',
            },
          ].map((row) => (
            <div
              key={row.label}
              data-note-row
              className="grid gap-6 border-t border-[#3E2E22]/12 pt-10 md:grid-cols-[0.8fr_1.2fr]"
            >
              <p className="font-sans text-[10px] tracking-[0.35em] text-[#D4AF37]">
                {row.label}
              </p>
              <div>
                <h3 className="font-display text-3xl font-light">{row.title}</h3>
                <p className="mt-3 max-w-md font-sans text-sm font-light leading-relaxed text-[#3E2E22]/80">
                  {row.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#3E2E22]/10 bg-[#E8DCCB]/35 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <h2
              data-reveal
              className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-light"
            >
              The Collection
            </h2>
            <Link
              to="/shop"
              className="font-sans text-[10px] tracking-[0.28em] text-[#7B5E3B] no-underline"
            >
              SHOP →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((p) => (
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
