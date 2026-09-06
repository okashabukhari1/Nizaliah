import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scroll via Lenis, wired to GSAP ScrollTrigger.
 * Stays paused until the intro loader finishes so load stays responsive.
 */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.15,
      wheelMultiplier: 0.92,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const intro = document.getElementById('niz-intro')
    const introBlocking =
      intro && !intro.classList.contains('is-done')
    if (introBlocking) lenis.stop()

    const onIntroDone = () => {
      lenis.start()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
    window.addEventListener('nizaliah:intro-dismissed', onIntroDone)

    const ticker = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    return () => {
      window.removeEventListener('nizaliah:intro-dismissed', onIntroDone)
      gsap.ticker.remove(ticker)
      lenis.destroy()
    }
  }, [enabled])
}
