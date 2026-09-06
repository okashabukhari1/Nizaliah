import { Link } from 'react-router-dom'
import { useJourney } from '../hooks/JourneyContext'
import { useBottleLanded } from '../hooks/useBottleLanded'
import { products, JANAN_BOTTLE_SRC } from '../data/products'
import MagneticCarousel from './MagneticCarousel'

/** Home collection — JANAN SPORT remains the bottle landing target. */
const HOME_ORDER = [
  'luxury-incense',
  'amber-veil',
  'janan-sport',
  'the-royal-oud',
  'noir-musk',
  'rose-eclat',
]

export default function ProductsSection({ reducedMotion }) {
  const { setProductSlot } = useJourney()
  const bottleLanded = useBottleLanded()
  const showCardBottle = reducedMotion || bottleLanded

  const carouselItems = HOME_ORDER.map((slug) => {
    const product = products.find((p) => p.slug === slug)
    if (!product) return null
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      subtitle: product.type,
      // JANAN keeps a dark empty slot until the traveler lands
      src: product.primary ? null : product.image,
      href: `/product/${product.slug}`,
      primary: product.primary,
      product,
    }
  }).filter(Boolean)

  return (
    <section
      id="products"
      className="relative overflow-visible bg-[#E8DCCB]/55 px-4 py-24 md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex max-w-xl flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:max-w-none">
          <div>
            <p className="mb-3 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]">
              COLLECTION
            </p>
            <h2 className="font-display text-[clamp(2.4rem,5vw,3.75rem)] font-light leading-none text-[#3E2E22]">
              Products
            </h2>
          </div>
          <Link
            to="/shop"
            className="font-sans text-[10px] tracking-[0.3em] text-[#3E2E22] no-underline opacity-70 hover:opacity-100"
          >
            VIEW ALL →
          </Link>
        </div>

        <MagneticCarousel
          items={carouselItems}
          collapsedWidth={92}
          hoverWidth={190}
          collapsedHeight={360}
          hoverHeight={420}
          openSize={500}
          gap={14}
          influence={210}
          blur={2.5}
          renderSlot={(item) => {
            if (!item.primary) return null
            return (
              <>
                <div
                  ref={setProductSlot}
                  id="janan-sport-target"
                  className="product-image-area product-image-area--target absolute inset-[10%] z-0"
                  aria-hidden
                />
                {/* Show JANAN image on the card when the traveler lands (or reduced motion) */}
                <img
                  src={JANAN_BOTTLE_SRC}
                  alt=""
                  className="pointer-events-none absolute inset-0 z-[1] m-auto max-h-[82%] max-w-[82%] object-contain transition-opacity duration-300"
                  style={{
                    mixBlendMode: 'screen',
                    opacity: showCardBottle ? 1 : 0,
                  }}
                />
              </>
            )
          }}
        />

        <p className="mt-4 text-center font-sans text-[9px] tracking-[0.32em] text-[#7B5E3B]/70">
          HOVER TO EXPLORE · CLICK TO OPEN
        </p>
      </div>
    </section>
  )
}
