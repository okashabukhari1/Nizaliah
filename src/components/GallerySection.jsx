import FloatingGallery from './FloatingGallery'
import { products } from '../data/products'

const GALLERY_IMAGES = products.slice(0, 6).map((p) => ({
  src: p.image,
  link: `/product/${p.slug}`,
  alt: p.name,
}))

/**
 * Campaign floating gallery — product stills drift and open on click.
 */
export default function GallerySection() {
  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-[#18140F] px-6 py-20 md:py-24"
    >
      <div className="relative z-[1] mx-auto mb-10 max-w-6xl md:mb-12">
        <p className="mb-4 font-sans text-[10px] tracking-[0.35em] text-[#D4AF37]">
          CAMPAIGN
        </p>
        <h2 className="max-w-xl font-display text-[clamp(2.2rem,5vw,3.75rem)] font-light leading-[1.05] text-[#F8F4EE]">
          Still frames from the house.
        </h2>
        <p className="mt-5 max-w-md font-sans text-sm font-light leading-relaxed text-[#E8DCCB]/85">
          Click a frame to open it. Click again to release — or follow it into
          the fragrance.
        </p>
      </div>

      <div className="relative mx-auto h-[min(78vh,720px)] w-full max-w-6xl overflow-hidden">
        <FloatingGallery
          images={GALLERY_IMAGES}
          background="transparent"
          cardWidth={210}
          cardHeight={268}
          rounded={10}
          speed={38}
          fade={14}
          style={{ minHeight: '100%' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-24 bg-gradient-to-b from-[#18140F] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-t from-[#18140F] to-transparent"
        />
      </div>
    </section>
  )
}
