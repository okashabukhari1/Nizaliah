import { useJourney } from '../hooks/JourneyContext'

export default function PassageSection() {
  const { setMidSlot } = useJourney()

  return (
    <section className="relative overflow-visible bg-[#F8F4EE] px-6 py-20 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 font-sans text-[10px] tracking-[0.4em] text-[#7B5E3B]">
            CONTINUE
          </p>
          <h2 className="max-w-xl font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-tight text-[#3E2E22]">
            From the first room to the collection — one continuous object.
          </h2>
          <p className="mt-5 max-w-md font-sans text-sm font-light leading-relaxed text-[#3E2E22]/80">
            Keep scrolling. The bottle descends through the narrative and
            settles into JANAN SPORT below.
          </p>
        </div>
        <div className="flex min-h-[36vh] items-center justify-center">
          <div
            ref={setMidSlot}
            id="mid-bottle-slot"
            className="h-[min(36vh,320px)] w-[min(26vw,200px)]"
            aria-hidden
          />
        </div>
      </div>
    </section>
  )
}
