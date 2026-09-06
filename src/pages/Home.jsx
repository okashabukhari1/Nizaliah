import { useState } from 'react'
import Hero from '../components/Hero'
import EditorialSection from '../components/EditorialSection'
import PassageSection from '../components/PassageSection'
import ProductsSection from '../components/ProductsSection'
import GallerySection from '../components/GallerySection'
import CTASection from '../components/CTASection'
import BottleTraveler from '../components/BottleTraveler'
import { JourneyProvider } from '../hooks/JourneyContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/**
 * Homepage — Hero → Editorial → Passage → Products → Gallery → CTA
 */
export default function Home() {
  const reducedMotion = useReducedMotion()
  const [sequenceProgress, setSequenceProgress] = useState(0)
  useDocumentTitle('NIZALIAH — JANAN SPORT Eau de Parfum')

  return (
    <JourneyProvider>
      <div className="relative bg-[#F8F4EE]">
        <main id="journey-track">
          <Hero
            reducedMotion={reducedMotion}
            onSequenceProgress={setSequenceProgress}
          />
          <EditorialSection />
          <PassageSection />
          <ProductsSection reducedMotion={reducedMotion} />
          <GallerySection />
          <CTASection
            title="Enter the collection."
            body="Explore every NIZALIAH composition — from JANAN SPORT to the deeper woods and florals."
            cta={{ to: '/shop', label: 'SHOP THE COLLECTION' }}
          />
        </main>
      </div>

      <BottleTraveler
        reducedMotion={reducedMotion}
        sequenceProgress={sequenceProgress}
      />
    </JourneyProvider>
  )
}
