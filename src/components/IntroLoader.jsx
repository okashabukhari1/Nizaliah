import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { CRITICAL_STILLS, preloadImages } from '../utils/frameLoader'

const INTRO_ID = 'niz-intro'
const READY_EVENT = 'nizaliah:intro-ready'
const PROGRESS_EVENT = 'nizaliah:intro-progress'

const STATUS_WORDS = ['COMPOSING', 'BLENDING', 'SETTLING', 'REFINING', 'READY']
const LINE_WORDS = [
  'A fragrance journey is being prepared.',
  'Notes are settling into place.',
  'Light, texture, and motion align.',
  'The house is almost open.',
  'Welcome to NIZALIAH.',
]

/**
 * Award-style full-screen loader.
 * Preloads critical stills + waits for hero frame progress, then auto-reveals.
 * No keyboard gate.
 */
export default function IntroLoader() {
  const { pathname } = useLocation()
  const progressRef = useRef(0)
  const frameRatioRef = useRef(0)
  const stillsRatioRef = useRef(0)
  const readyRef = useRef(false)
  const dismissedRef = useRef(false)

  useEffect(() => {
    const el = document.getElementById(INTRO_ID)
    if (!el || el.classList.contains('is-done')) {
      document.body.classList.remove('niz-loading')
      return undefined
    }

    document.body.classList.add('niz-loading')
    progressRef.current = 0
    frameRatioRef.current = 0
    stillsRatioRef.current = 0
    readyRef.current = false
    dismissedRef.current = false

    const bar = el.querySelector('#niz-intro-bar')
    const pct = el.querySelector('#niz-intro-pct')
    const status = el.querySelector('#niz-intro-status')
    const line = el.querySelector('#niz-intro-line')
    const label = el.querySelector('#niz-intro-label')

    const ctx = gsap.context(() => {
      gsap.set(
        [
          '.niz-intro-brand',
          '.niz-intro-logo',
          '.niz-intro-row',
          '.niz-intro-track',
          '.niz-intro-meta',
          '.niz-intro-line',
          '.niz-intro-rule',
        ],
        { autoAlpha: 0 },
      )
      if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })

      gsap
        .timeline()
        .to('.niz-intro-rule', { autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
        .to('.niz-intro-brand', { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, '-=0.2')
        .fromTo(
          '.niz-intro-logo',
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.65, ease: 'power3.out' },
          '-=0.15',
        )
        .fromTo(
          '.niz-intro-row',
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' },
          '-=0.3',
        )
        .to(
          ['.niz-intro-track', '.niz-intro-meta', '.niz-intro-line'],
          { autoAlpha: 1, duration: 0.5 },
          '-=0.25',
        )
    }, el)

    let displayedPct = 0
    const setProgress = (value, { force = false } = {}) => {
      const next = Math.min(1, Math.max(0, value))
      const p = force ? next : Math.max(progressRef.current, next)
      progressRef.current = p
      const percent = Math.round(p * 100)

      if (bar) {
        gsap.to(bar, {
          scaleX: p,
          duration: force ? 0.5 : 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
          transformOrigin: 'left center',
        })
      }

      if (pct && (force || Math.abs(percent - displayedPct) >= 1)) {
        displayedPct = percent
        pct.textContent = String(percent).padStart(2, '0')
      }

      if (status && !readyRef.current) {
        const idx = Math.min(
          STATUS_WORDS.length - 1,
          Math.floor(p * (STATUS_WORDS.length - 0.01)),
        )
        status.textContent = STATUS_WORDS[idx]
        if (line) line.textContent = LINE_WORDS[idx]
      }
    }

    const combinedProgress = () => {
      // Frames dominate load time; stills are a small share
      const combined = frameRatioRef.current * 0.88 + stillsRatioRef.current * 0.12
      setProgress(Math.min(0.985, combined))
    }

    // Soft crawl while real assets catch up — never blocks completion
    const tick = gsap.to(
      { v: 0 },
      {
        v: 0.72,
        duration: 10,
        ease: 'power1.out',
        onUpdate() {
          if (readyRef.current) return
          setProgress(Math.max(progressRef.current, this.targets()[0].v * 0.35))
        },
      },
    )

    const dismiss = () => {
      if (dismissedRef.current) return
      dismissedRef.current = true
      readyRef.current = true
      tick.kill()
      setProgress(1, { force: true })
      if (status) status.textContent = 'READY'
      if (label) label.textContent = 'OPENING'
      if (line) line.textContent = LINE_WORDS[LINE_WORDS.length - 1]

      gsap
        .timeline({
          onComplete: () => {
            el.classList.add('is-done')
            el.setAttribute('aria-busy', 'false')
            document.body.classList.remove('niz-loading')
            window.dispatchEvent(new Event('nizaliah:intro-dismissed'))
            el.remove()
          },
        })
        .to('.niz-intro-inner', {
          y: -18,
          autoAlpha: 0,
          duration: 0.55,
          ease: 'power2.in',
          delay: 0.28,
        })
        .to(
          el,
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.85,
            ease: 'power3.inOut',
          },
          '-=0.15',
        )
    }

    const onProgress = (e) => {
      const ratio = Number(e.detail?.ratio)
      if (!Number.isFinite(ratio) || readyRef.current) return
      frameRatioRef.current = Math.min(1, Math.max(0, ratio))
      combinedProgress()
    }

    const onReady = () => {
      if (readyRef.current) return
      readyRef.current = true
      tick.kill()
      frameRatioRef.current = 1
      stillsRatioRef.current = 1
      setProgress(1, { force: true })
      window.setTimeout(dismiss, 420)
    }

    // Preload product / brand stills in parallel with hero frames
    preloadImages(CRITICAL_STILLS, (loaded, total) => {
      stillsRatioRef.current = total > 0 ? loaded / total : 1
      if (!readyRef.current) combinedProgress()
    }).then(() => {
      stillsRatioRef.current = 1
      if (!readyRef.current) combinedProgress()
      // Non-home routes have no hero frames — finish after stills
      if (pathname !== '/') onReady()
    })

    gsap.set(el, { clipPath: 'inset(0 0 0% 0)' })

    window.addEventListener(PROGRESS_EVENT, onProgress)
    window.addEventListener(READY_EVENT, onReady)

    const failsafe = window.setTimeout(
      onReady,
      pathname !== '/' ? 2500 : 24000,
    )

    return () => {
      tick.kill()
      ctx.revert()
      window.removeEventListener(PROGRESS_EVENT, onProgress)
      window.removeEventListener(READY_EVENT, onReady)
      window.clearTimeout(failsafe)
    }
  }, [pathname])

  return null
}

export function signalIntroReady() {
  window.dispatchEvent(new Event(READY_EVENT))
}

export function signalIntroProgress(loaded, total) {
  const ratio = total > 0 ? loaded / total : 0
  window.dispatchEvent(
    new CustomEvent(PROGRESS_EVENT, { detail: { ratio, loaded, total } }),
  )
}
