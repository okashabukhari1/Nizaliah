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
    // Slightly larger step = fewer decodes, smoother load, still fluid scrub
    const step = mobile ? 4 : 3

    let disposed = false
    let paintRaf = 0
    let smoothRaf = 0
    let loader = null
    let st = null
    let targetProgress = 0
    let smoothProgress = 0
    let lastTs = performance.now()
    let lastPaintedIdx = -1

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      lastPaintedIdx = -1
    }

    const paint = () => {
      paintRaf = 0
      if (disposed) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight

      if (!loader) {
        ctx.fillStyle = '#18140F'
        ctx.fillRect(0, 0, w, h)
        return
      }

      const progress = reducedMotion ? 1 : progressRef.current
      const idx = loader.getFrameIndex(progress)
      const img = loader.getFrame(progress)
      if (!img) return
      // Same frame — keep what's already on canvas (don't flash the fill color)
      if (idx === lastPaintedIdx && lastPaintedIdx >= 0) return

      ctx.fillStyle = '#18140F'
      ctx.fillRect(0, 0, w, h)
      const scale = Math.max(w / img.width, h / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
      lastPaintedIdx = idx
    }

    const requestPaint = (force = false) => {
      if (force) lastPaintedIdx = -1
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

      smoothProgress += delta * (1 - Math.exp(-FRAME_SMOOTH * dt))
      publish(smoothProgress)
    }

    const setTarget = (p) => {
      targetProgress = Math.min(1, Math.max(0, p))
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      requestPaint(true)
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
      const priorityCount = mobile ? 20 : 36
      loader = createPlaylistLoader(SCENE_PLAYLIST, {
        step,
        priorityCount,
        concurrency: mobile ? 4 : 6,
        onProgress: (loaded, total) => {
          signalIntroProgress(loaded, total)
          // Paint sparingly while decoding so the loader stays smooth
          if (loaded === 1 || loaded === priorityCount || loaded % 12 === 0) {
            requestPaint(true)
          }
        },
      })
      await loader.start()
      if (disposed) return
      signalIntroProgress(1, 1)
      signalIntroReady()
      requestPaint(true)
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
