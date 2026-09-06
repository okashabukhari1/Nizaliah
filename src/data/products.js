/**
 * Centralized NIZALIAH product catalogue (frontend-only).
 * JANAN SPORT uses the real bottle asset — do not replace.
 */

export const JANAN_BOTTLE_SRC = '/images/bottel-image.png'

export const products = [
  {
    id: 'janan-sport',
    slug: 'janan-sport',
    name: 'JANAN SPORT',
    category: 'Signature',
    type: 'Eau de Parfum',
    price: 185,
    currency: 'USD',
    character: 'Fresh / Woody / Energetic',
    shortDescription:
      'Bright at first breath, grounded in the dry-down — composed for movement and presence.',
    description:
      'JANAN SPORT opens with a crisp, luminous freshness that settles into warm woods. Designed for those who move through the day with intention — energetic yet refined, never loud.',
    notes: {
      top: ['Bergamot', 'Green Apple', 'Pink Pepper'],
      heart: ['Lavender', 'Geranium', 'Cedar'],
      base: ['Vetiver', 'Amberwood', 'Musk'],
    },
    intensity: 'Moderate',
    longevity: '6–8 hours',
    size: '100ml',
    image: JANAN_BOTTLE_SRC,
    gallery: [JANAN_BOTTLE_SRC, '/images/janan-sport.png'],
    featured: true,
    primary: true,
  },
  {
    id: 'luxury-incense',
    slug: 'luxury-incense',
    name: 'LUXURY INCENSE',
    category: 'Oriental',
    type: 'Eau de Parfum',
    price: 210,
    currency: 'USD',
    character: 'Oriental / Smoky / Warm',
    shortDescription:
      'A smoky incense trail wrapped in warm resins — intimate and enveloping.',
    description:
      'LUXURY INCENSE unfolds like a quiet chamber of resin and smoke. Warm, oriental, and deeply atmospheric — a fragrance for evenings that linger.',
    notes: {
      top: ['Frankincense', 'Elemi', 'Black Pepper'],
      heart: ['Myrrh', 'Labdanum', 'Rose Absolute'],
      base: ['Benzoin', 'Oud', 'Vanilla'],
    },
    intensity: 'Rich',
    longevity: '8–10 hours',
    size: '100ml',
    image: '/images/luxury-intense.png',
    gallery: ['/images/luxury-intense.png'],
    featured: true,
    primary: false,
  },
  {
    id: 'the-royal-oud',
    slug: 'the-royal-oud',
    name: 'THE ROYAL OUD',
    category: 'Woody',
    type: 'Eau de Parfum',
    price: 245,
    currency: 'USD',
    character: 'Oud / Woody / Rich',
    shortDescription:
      'Deep oud and polished woods — regal, dense, and unmistakably composed.',
    description:
      'THE ROYAL OUD is a study in depth. Rich oud meets polished woods and soft spices — a fragrance that feels architectural and enduring.',
    notes: {
      top: ['Saffron', 'Cardamom', 'Bergamot'],
      heart: ['Oud', 'Rose', 'Patchouli'],
      base: ['Sandalwood', 'Amber', 'Leather'],
    },
    intensity: 'Intense',
    longevity: '10–12 hours',
    size: '100ml',
    image: '/images/royal-oud.jpg',
    gallery: ['/images/royal-oud.jpg'],
    featured: true,
    primary: false,
  },
  {
    id: 'amber-veil',
    slug: 'amber-veil',
    name: 'AMBER VEIL',
    category: 'Amber',
    type: 'Eau de Parfum',
    price: 195,
    currency: 'USD',
    character: 'Amber / Warm / Sensual',
    shortDescription:
      'A soft amber veil — warm, sensual, and quietly luminous.',
    description:
      'AMBER VEIL drapes the skin in golden warmth. Soft resins and creamy woods create a sensual trail that feels intimate rather than obvious.',
    notes: {
      top: ['Orange Blossom', 'Pink Pepper', 'Mandarin'],
      heart: ['Amber', 'Jasmine', 'Tonka'],
      base: ['Vanilla', 'Sandalwood', 'Musk'],
    },
    intensity: 'Soft-Moderate',
    longevity: '7–9 hours',
    size: '100ml',
    image: '/images/amber-veil.jpg',
    gallery: ['/images/amber-veil.jpg', '/images/midnight-mystery.jpg'],
    featured: false,
    primary: false,
  },
  {
    id: 'noir-musk',
    slug: 'noir-musk',
    name: 'NOIR MUSK',
    category: 'Musk',
    type: 'Eau de Parfum',
    price: 175,
    currency: 'USD',
    character: 'Musk / Dark / Elegant',
    shortDescription:
      'Dark musk with a polished edge — elegant, nocturnal, precise.',
    description:
      'NOIR MUSK is composed for night. Clean dark musks meet soft woods and a hint of spice — elegant without excess.',
    notes: {
      top: ['Bergamot', 'Black Pepper', 'Aldehydes'],
      heart: ['Iris', 'Violet', 'Cashmere Wood'],
      base: ['White Musk', 'Ambrette', 'Cedar'],
    },
    intensity: 'Moderate',
    longevity: '6–8 hours',
    size: '100ml',
    image: '/images/noir-musk.jpg',
    gallery: ['/images/noir-musk.jpg'],
    featured: false,
    primary: false,
  },
  {
    id: 'rose-eclat',
    slug: 'rose-eclat',
    name: 'ROSE ÉCLAT',
    category: 'Floral',
    type: 'Eau de Parfum',
    price: 190,
    currency: 'USD',
    character: 'Floral / Rose / Refined',
    shortDescription:
      'A luminous rose — refined, modern, and finely drawn.',
    description:
      'ROSE ÉCLAT presents rose with clarity and restraint. Bright petals over soft woods — floral without nostalgia, refined without formality.',
    notes: {
      top: ['Lychee', 'Bergamot', 'Pink Pepper'],
      heart: ['Damask Rose', 'Peony', 'Magnolia'],
      base: ['Musk', 'Cedar', 'Soft Amber'],
    },
    intensity: 'Soft-Moderate',
    longevity: '6–8 hours',
    size: '100ml',
    image: '/images/rose-eclat.jpg',
    gallery: ['/images/rose-eclat.jpg'],
    featured: false,
    primary: false,
  },
]

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || null
}

export function getRelatedProducts(slug, limit = 3) {
  return products.filter((p) => p.slug !== slug).slice(0, limit)
}

export function formatPrice(product) {
  return `$${product.price}`
}

export const JANAN_SPORT = products.find((p) => p.primary)
