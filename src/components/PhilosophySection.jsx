import { Link } from 'react-router-dom'

export default function PhilosophySection() {
  return (
    <section
      id="philosophy"
      className="relative overflow-hidden bg-[#F4DEDF] px-6 py-24 text-[#3E2E22] md:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-20">
        <div>
          <p className="mb-4 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]">
            FRAGRANCE PHILOSOPHY
          </p>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-light leading-[1.05]">
            The language of scent is presence.
          </h2>
        </div>
        <div className="flex flex-col justify-end gap-6">
          <p className="max-w-md font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85">
            NIZALIAH composes fragrances as editorial moments — measured,
            sensual, and made to linger. Each composition begins with a feeling
            of place, then finds its structure in top, heart, and base.
          </p>
          <Link
            to="/fragrance"
            className="w-fit border-b border-[#D4AF37]/70 pb-1 font-sans text-[10px] tracking-[0.3em] text-[#3E2E22] no-underline"
          >
            READ THE FRAGRANCE WORLD →
          </Link>
        </div>
      </div>
    </section>
  )
}
