import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useJourney } from '../hooks/JourneyContext'
import { BOTTLE_SRC } from './BottleTraveler'
import HeroFrames from './HeroFrames'

export default function Hero({ reducedMotion, onSequenceProgress }) {
  const { setHeroSlot } = useJourney()
  const titleRef = useRef(null)

  useEffect(() => {
    if (reducedMotion || !titleRef.current) return undefined
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-line]', {
        yPercent: 110,
        duration: 1.25,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.15,
      })
      gsap.from('[data-hero-sub]', {
        opacity: 0,
        y: 16,
        duration: 1,
        ease: 'power2.out',
        delay: 0.85,
      })
    }, titleRef)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#18140F] px-6 pb-20 pt-28"
    >
      <HeroFrames
        reducedMotion={reducedMotion}
        onSequenceProgress={onSequenceProgress}
      />

      {/* Soft vignette so type stays readable over frames */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(90deg, rgba(26,18,24,0.72) 0%, rgba(26,18,24,0.35) 42%, rgba(26,18,24,0.15) 100%)',
        }}
      />

      {/* Center slot — oversized bottle on last frame */}
      <div
        ref={setHeroSlot}
        id="hero-bottle-slot"
        className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[105svh] w-[min(88vw,560px)] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      />

      {reducedMotion && (
        <img
          src={BOTTLE_SRC}
          alt="JANAN SPORT Eau de Parfum"
          className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[105svh] w-[min(88vw,560px)] -translate-x-1/2 -translate-y-1/2 object-contain"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      <div
        ref={titleRef}
        className="relative z-[3] mx-auto w-full max-w-6xl"
      >
        <div className="max-w-xl">
          <p
            data-hero-sub
            className="mb-5 font-sans text-[10px] font-medium tracking-[0.4em] text-[#E8DCCB]"
          >
            NIZALIAH PERFUME
          </p>
          <div className="overflow-hidden">
            <h1
              data-hero-line
              className="font-display text-[clamp(3.5rem,11vw,7.5rem)] font-light leading-[0.9] tracking-tight text-[#F8F4EE]"
            >
              JANAN
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1
              data-hero-line
              className="font-display text-[clamp(3.5rem,11vw,7.5rem)] font-light leading-[0.9] tracking-tight text-[#D4AF37]"
            >
              SPORT
            </h1>
          </div>
          <p
            data-hero-sub
            className="mt-6 max-w-sm font-sans text-sm font-light leading-relaxed tracking-wide text-[#E8DCCB]"
          >
            Eau de Parfum. Scroll through the campaign — then follow the bottle
            into the collection.
          </p>
          <p
            data-hero-sub
            className="mt-8 font-sans text-[10px] tracking-[0.35em] text-[#D4AF37]"
          >
            EAU DE PARFUM
          </p>
        </div>
      </div>
    </section>
  )
}
