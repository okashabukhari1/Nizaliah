import { createContext, useContext, useMemo, useRef } from 'react'

const JourneyContext = createContext(null)

export function JourneyProvider({ children }) {
  const refs = useRef({
    heroSlot: null,
    waypointSlot: null,
    midSlot: null,
    productSlot: null,
    track: null,
  })

  const api = useMemo(
    () => ({
      setHeroSlot: (el) => {
        refs.current.heroSlot = el
      },
      setWaypointSlot: (el) => {
        refs.current.waypointSlot = el
      },
      setMidSlot: (el) => {
        refs.current.midSlot = el
      },
      setProductSlot: (el) => {
        refs.current.productSlot = el
      },
      setTrack: (el) => {
        refs.current.track = el
      },
      getRefs: () => refs.current,
    }),
    [],
  )

  return (
    <JourneyContext.Provider value={api}>{children}</JourneyContext.Provider>
  )
}

export function useJourney() {
  const ctx = useContext(JourneyContext)
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider')
  return ctx
}
