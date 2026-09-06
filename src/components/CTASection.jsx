import { Link } from 'react-router-dom'

export default function CTASection({
  eyebrow = 'THE HOUSE',
  title = 'Discover the collection.',
  body = 'Six compositions. One continuous sense of presence.',
  cta = { to: '/shop', label: 'ENTER THE COLLECTION' },
  tone = 'espresso',
}) {
  const dark = tone === 'espresso' || tone === 'plum'

  return (
    <section
      className={`relative px-6 py-24 md:py-28 ${
        dark ? 'bg-[#3E2E22] text-[#F8F4EE]' : 'bg-[#F4DEDF] text-[#3E2E22]'
      }`}
    >
      <div className="mx-auto max-w-3xl text-center" data-reveal>
        <p
          className={`mb-4 font-sans text-[10px] tracking-[0.35em] ${
            dark ? 'text-[#D4AF37]' : 'text-[#7B5E3B]'
          }`}
        >
          {eyebrow}
        </p>
        <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-light leading-[1.05]">
          {title}
        </h2>
        <p
          className={`mx-auto mt-5 max-w-md font-sans text-sm font-light leading-relaxed ${
            dark ? 'text-[#E8DCCB]/85' : 'text-[#3E2E22]/80'
          }`}
        >
          {body}
        </p>
        <Link
          to={cta.to}
          className={`mt-10 inline-block border px-8 py-3 font-sans text-[10px] tracking-[0.32em] no-underline transition-colors ${
            dark
              ? 'border-[#D4AF37]/60 text-[#F8F4EE] hover:bg-[#D4AF37]/15'
              : 'border-[#3E2E22]/40 text-[#3E2E22] hover:bg-[#3E2E22] hover:text-[#F8F4EE]'
          }`}
        >
          {cta.label}
        </Link>
      </div>
    </section>
  )
}
