import { useJourney } from '../hooks/JourneyContext'

export default function EditorialSection() {
  const { setWaypointSlot } = useJourney()

  return (
    <section
      id="editorial"
      className="relative overflow-visible bg-[#F4DEDF] px-6 py-24 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <p className="mb-4 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]">
            THE HOUSE
          </p>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] font-light leading-[1.05] text-[#3E2E22]">
            Scent is an expression of presence.
          </h2>
          <p className="mt-6 max-w-md font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85">
            NIZALIAH composes fragrances as editorial moments — measured,
            sensual, and made to linger. JANAN SPORT opens the journey: bright
            at first breath, grounded in the dry-down.
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative aspect-[4/5] w-full max-w-sm border border-[#3E2E22]/20 bg-[#E8DCCB]/40">
            <div
              ref={setWaypointSlot}
              id="waypoint-bottle-slot"
              className="absolute inset-[10%]"
              aria-hidden
            />
            <p className="absolute bottom-5 left-5 font-sans text-[9px] tracking-[0.3em] text-[#7B5E3B]">
              PASSAGE
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
