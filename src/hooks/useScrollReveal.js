import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Subtle scroll reveals for pages using [data-reveal].
 */
export function useScrollReveal(selector = '[data-reveal]') {
  const rootRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return undefined

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray(selector)
      nodes.forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      })
    }, root)

    return () => ctx.revert()
  }, [selector, reduced])

  return rootRef
}
