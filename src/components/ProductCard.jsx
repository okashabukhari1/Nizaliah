import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'

export default function ProductCard({ product, tone = 'light' }) {
  const dark = tone === 'dark'

  return (
    <article
      className={`group flex flex-col border transition-[border-color,transform] duration-500 ${
        dark
          ? 'border-[#F8F4EE]/20 bg-[#3E2E22]/40 hover:border-[#D4AF37]/50'
          : 'border-[#3E2E22]/15 bg-[#E8DCCB]/35 hover:border-[#D4AF37]/55'
      }`}
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex flex-1 flex-col no-underline"
      >
        <div
          className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden px-6 ${
            dark ? 'bg-[#18140F]/55' : 'bg-[#F8F4EE]'
          }`}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`max-h-[78%] object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03] group-hover:-translate-y-1 ${
              product.primary ? '' : ''
            }`}
            style={
              product.primary
                ? { mixBlendMode: dark ? 'screen' : 'normal' }
                : undefined
            }
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 px-5 py-5">
          <h3
            className={`font-display text-2xl font-light tracking-wide ${
              dark ? 'text-[#F8F4EE]' : 'text-[#3E2E22]'
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`font-sans text-[10px] tracking-[0.28em] ${
              dark ? 'text-[#E8DCCB]/80' : 'text-[#7B5E3B]'
            }`}
          >
            {product.type}
          </p>
          <p
            className={`mt-1 font-sans text-xs font-light leading-relaxed ${
              dark ? 'text-[#E8DCCB]/75' : 'text-[#3E2E22]/80'
            }`}
          >
            {product.character}
          </p>
          <div className="mt-auto flex items-end justify-between pt-5">
            <span
              className={`font-sans text-sm ${
                dark ? 'text-[#F8F4EE]' : 'text-[#3E2E22]'
              }`}
            >
              {formatPrice(product)}
            </span>
            <span className="font-sans text-[10px] tracking-[0.28em] text-[#D4AF37]">
              VIEW FRAGRANCE →
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
