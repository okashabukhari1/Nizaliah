import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createPlaylistLoader, SCENE_PLAYLIST } from '../utils/frameLoader'
import { signalIntroReady, signalIntroProgress } from './IntroLoader'

gsap.registerPlugin(ScrollTrigger)

/** Lenis-like exponential catch-up (higher = snappier, lower = silkier). */
const FRAME_SMOOTH = 8.5

/**
 * Scene frames ONLY as the hero background.
 * Hero is pinned while Scenes 1→5 scrub; missing frames hold the last good one.
 * Progress is eased toward the scroll target for Lenis-smooth frame motion.
 */
export default function HeroFrames({
  reducedMotion = false,
  onSequenceProgress,
}) {
  const canvasRef = useRef(null)
  const progressRef = useRef(0)
  const onProgressRef = useRef(onSequenceProgress)
  onProgressRef.current = onSequenceProgress

  useEffect(() => {
    const canvas = canvasRef.current
    const hero = document.querySelector('#hero')
    if (!canvas || !hero) return undefined

    const ctx = canvas.getContext('2d', { alpha: false })
    const mobile = window.matchMedia('(max-width: 768px)').matches
    const step = mobile ? 3 : 2

    let disposed = false
    let paintRaf = 0
    let smoothRaf = 0
    let loader = null
    let st = null
    let targetProgress = 0
    let smoothProgress = 0
    let lastTs = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const paint = () => {
      paintRaf = 0
      if (disposed) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.fillStyle = '#18140F'
      ctx.fillRect(0, 0, w, h)

      if (!loader) return
      const progress = reducedMotion ? 1 : progressRef.current
      const img = loader.getFrame(progress)
      if (!img) return

      const scale = Math.max(w / img.width, h / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
    }

    const requestPaint = () => {
      if (!paintRaf) paintRaf = requestAnimationFrame(paint)
    }

    const publish = (p) => {
      progressRef.current = p
      onProgressRef.current?.(p)
      requestPaint()
    }

    const smoothTick = (now) => {
      if (disposed) return
      smoothRaf = requestAnimationFrame(smoothTick)

      let dt = (now - lastTs) / 1000
      lastTs = now
      if (!Number.isFinite(dt) || dt < 0) dt = 0
      if (dt > 0.05) dt = 0.05

      const delta = targetProgress - smoothProgress
      if (Math.abs(delta) < 0.00004) {
        if (smoothProgress !== targetProgress) {
          smoothProgress = targetProgress
          publish(smoothProgress)
        }
        return
      }

      // Same exponential blend Lenis uses for velocity catch-up
      smoothProgress += delta * (1 - Math.exp(-FRAME_SMOOTH * dt))
      publish(smoothProgress)
    }

    const setTarget = (p) => {
      targetProgress = Math.min(1, Math.max(0, p))
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      requestPaint()
    })
    ro.observe(canvas)

    if (!reducedMotion) {
      lastTs = performance.now()
      smoothRaf = requestAnimationFrame(smoothTick)

      st = ScrollTrigger.create({
        id: 'hero-frames',
        trigger: hero,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * 4.8)}`,
        pin: true,
        scrub: 1.25,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setTarget(self.progress),
        onRefresh: (self) => {
          setTarget(self.progress)
          smoothProgress = self.progress
          publish(smoothProgress)
        },
      })

      requestAnimationFrame(() => {
        if (!disposed) ScrollTrigger.refresh()
      })
    } else {
      publish(1)
      signalIntroReady()
    }

    ;(async () => {
      const priorityCount = mobile ? 28 : 50
      loader = createPlaylistLoader(SCENE_PLAYLIST, {
        step,
        priorityCount,
        onProgress: (loaded, total) => {
          requestPaint()
          signalIntroProgress(loaded, total)
        },
      })
      await loader.start()
      if (disposed) return
      // Full scene load complete → intro can move to keyboard gate
      signalIntroProgress(1, 1)
      signalIntroReady()
      requestPaint()
      ScrollTrigger.refresh()
    })()

    return () => {
      disposed = true
      loader?.abort()
      cancelAnimationFrame(paintRaf)
      cancelAnimationFrame(smoothRaf)
      ro.disconnect()
      st?.kill()
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      id="hero-frames-canvas"
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  )
}
