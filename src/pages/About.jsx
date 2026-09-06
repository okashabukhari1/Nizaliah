import { Link } from 'react-router-dom'
import CTASection from '../components/CTASection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function About() {
  useDocumentTitle('NIZALIAH — The House')
  const root = useScrollReveal()

  return (
    <div ref={root} className="bg-[#F8F4EE] text-[#3E2E22]">
      <section className="px-6 pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <p
            data-reveal
            className="mb-4 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]"
          >
            NIZALIAH
          </p>
          <h1
            data-reveal
            className="max-w-3xl font-display text-[clamp(3rem,8vw,6rem)] font-light leading-[0.92]"
          >
            The House
          </h1>
          <p
            data-reveal
            className="mt-8 max-w-xl font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85"
          >
            NIZALIAH is a luxury perfume house composing fragrances as editorial
            moments — quiet, intentional, and made to linger on skin and memory.
          </p>
        </div>
      </section>

      <section className="bg-[#F4DEDF] px-6 py-24 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-20">
          <h2
            data-reveal
            className="font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-tight"
          >
            Our approach
          </h2>
          <div data-reveal>
            <p className="font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85">
              We begin with atmosphere — a room, a season, a movement through
              the day — then find the notes that hold it. Each composition is
              refined until it feels inevitable rather than decorated.
            </p>
            <p className="mt-5 font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85">
              JANAN SPORT is our signature: fresh, woody, energetic — the first
              expression of the house.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p
            data-reveal
            className="mb-4 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]"
          >
            THE ART OF COMPOSITION
          </p>
          <h2
            data-reveal
            className="max-w-2xl font-display text-[clamp(2.2rem,5vw,3.5rem)] font-light leading-[1.05]"
          >
            Structure. Restraint. Presence.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                t: 'Top',
                d: 'The first breath — bright, brief, and inviting.',
              },
              {
                t: 'Heart',
                d: 'The character of the fragrance — where identity settles.',
              },
              {
                t: 'Base',
                d: 'The memory that remains — warm, grounded, lasting.',
              },
            ].map((item) => (
              <div
                key={item.t}
                data-reveal
                className="border-t border-[#D4AF37]/55 pt-5"
              >
                <h3 className="font-display text-2xl font-light">{item.t}</h3>
                <p className="mt-3 font-sans text-sm font-light leading-relaxed text-[#3E2E22]/80">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#3E2E22]/10 bg-[#E8DCCB]/45 px-6 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div data-reveal>
            <p className="mb-3 font-sans text-[10px] tracking-[0.3em] text-[#7B5E3B]">
              THE COLLECTION
            </p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-light">
              Six compositions. One house.
            </h2>
          </div>
          <Link
            data-reveal
            to="/shop"
            className="font-sans text-[10px] tracking-[0.3em] text-[#3E2E22] no-underline"
          >
            EXPLORE →
          </Link>
        </div>
      </section>

      <CTASection
        tone="espresso"
        title="Meet JANAN SPORT."
        body="Our signature Eau de Parfum — the fragrance that opens the house."
        cta={{ to: '/product/janan-sport', label: 'DISCOVER JANAN SPORT' }}
      />
    </div>
  )
}
