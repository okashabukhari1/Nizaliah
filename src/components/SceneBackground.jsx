import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  createFrameLoader,
  discoverFrameCount,
  SCENE1_PATH,
} from '../utils/frameLoader'

gsap.registerPlugin(ScrollTrigger)

/**
 * Full-bleed Scene 1 frames as page background (cover).
 * Scrubbed by the same journey scroll progress.
 */
export default function SceneBackground({ reducedMotion = false }) {
  const canvasRef = useRef(null)
  const progressRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d', { alpha: false })
    const mobile = window.matchMedia('(max-width: 768px)').matches
    const step = mobile ? 3 : 2

    let disposed = false
    let raf = 0
    let lastDrawn = -1
    let loader = null

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      lastDrawn = -1
    }

    const paint = () => {
      raf = 0
      if (disposed) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.fillStyle = '#18140F'
      ctx.fillRect(0, 0, w, h)

      if (!loader) return
      const img = loader.getFrame(
        reducedMotion ? 0 : progressRef.current,
      )
      if (!img) return

      const frameIndex = loader.getFrameIndex(
        reducedMotion ? 0 : progressRef.current,
      )
      if (frameIndex === lastDrawn) return
      lastDrawn = frameIndex

      // cover
      const scale = Math.max(w / img.width, h / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      const dx = (w - dw) / 2
      const dy = (h - dh) / 2
      ctx.drawImage(img, dx, dy, dw, dh)
    }

    const requestPaint = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      requestPaint()
    })
    ro.observe(canvas)

    let st = null
    if (!reducedMotion) {
      st = ScrollTrigger.create({
        trigger: '#journey-track',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress
          requestPaint()
        },
      })
    }

    ;(async () => {
      const count = (await discoverFrameCount(SCENE1_PATH)) || 300
      if (disposed) return
      loader = createFrameLoader(count, SCENE1_PATH, {
        step,
        priorityCount: mobile ? 24 : 48,
        onProgress: () => {
          lastDrawn = -1
          requestPaint()
        },
      })
      await loader.start()
      if (disposed) return
      lastDrawn = -1
      requestPaint()
    })()

    return () => {
      disposed = true
      loader?.abort()
      cancelAnimationFrame(raf)
      ro.disconnect()
      st?.kill()
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      id="scene-background"
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
