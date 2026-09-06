import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#F8F4EE]/12 bg-[#3E2E22] px-6 py-16 text-[#F8F4EE]">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-block no-underline" aria-label="NIZALIAH home">
            <img
              src="/images/logo-white.png"
              alt="NIZALIAH Perfume"
              className="h-14 w-auto object-contain md:h-16"
            />
          </Link>
          <p className="mt-5 max-w-sm font-sans text-sm font-light leading-relaxed text-[#E8DCCB]/85">
            A luxury perfume house composing fragrances for presence, memory,
            and movement.
          </p>
        </div>

        <div>
          <p className="mb-4 font-sans text-[10px] tracking-[0.3em] text-[#D4AF37]">
            EXPLORE
          </p>
          <ul className="flex flex-col gap-3 font-sans text-sm font-light">
            <li>
              <Link to="/shop" className="text-[#F8F4EE] no-underline opacity-80 hover:opacity-100">
                The Collection
              </Link>
            </li>
            <li>
              <Link to="/fragrance" className="text-[#F8F4EE] no-underline opacity-80 hover:opacity-100">
                Fragrance
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-[#F8F4EE] no-underline opacity-80 hover:opacity-100">
                The House
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-[#F8F4EE] no-underline opacity-80 hover:opacity-100">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 font-sans text-[10px] tracking-[0.3em] text-[#D4AF37]">
            SIGNATURE
          </p>
          <Link
            to="/product/janan-sport"
            className="font-display text-xl font-light text-[#F8F4EE] no-underline"
          >
            JANAN SPORT
          </Link>
          <p className="mt-2 font-sans text-xs font-light tracking-wide text-[#E8DCCB]/75">
            Eau de Parfum
          </p>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-3 border-t border-[#F8F4EE]/10 pt-8 font-sans text-[10px] tracking-[0.28em] text-[#E8DCCB]/65 md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} NIZALIAH PERFUME</span>
        <span>FRONTEND PREVIEW</span>
      </div>
    </footer>
  )
}
