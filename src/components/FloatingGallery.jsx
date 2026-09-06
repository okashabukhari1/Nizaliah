import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { animate } from 'motion/react'

const DEFAULT_TRANSITION = {
  type: 'tween',
  duration: 0.25,
  ease: [0, 0, 0.58, 1],
}

const DEFAULT_CARD_W = 220
const DEFAULT_CARD_H = 280
const SPEED_REF = 40
const ZOOM = 1.6
const ZOOM_FIT = 0.9

const LAYOUT = [
  { w: 220, h: 280, x: 12, y: 10 },
  { w: 260, h: 200, x: 42, y: 35 },
  { w: 200, h: 260, x: 74, y: 8 },
  { w: 240, h: 240, x: 26, y: 62 },
  { w: 220, h: 300, x: 60, y: 74 },
  { w: 180, h: 220, x: 88, y: 48 },
]

function hash01(i) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function roundedClip(w, h, pct) {
  const t = Math.max(0, Math.min(100, pct)) / 100
  const short = Math.min(w, h)
  const insetX = (t * (w - short)) / 2
  const insetY = (t * (h - short)) / 2
  return `inset(${insetY}px ${insetX}px round ${(t * short) / 2}px)`
}

/**
 * Physics floating gallery — drift, wrap, click-to-zoom.
 * Port of Originkit Floating Gallery (rAF-owned transforms).
 */
export default function FloatingGallery({
  images = [],
  background = '#18140F',
  cardWidth = 220,
  cardHeight = 280,
  rounded = 12,
  speed = 42,
  reach = 280,
  fade = 12,
  transition = DEFAULT_TRANSITION,
  style,
  className = '',
}) {
  const navigate = useNavigate()
  const slotSX = Math.max(1, cardWidth) / DEFAULT_CARD_W
  const slotSY = Math.max(1, cardHeight) / DEFAULT_CARD_H

  const rootRef = useRef(null)
  const partsRef = useRef([])
  const nodesRef = useRef([])
  const sizeRef = useRef({ w: 0, h: 0 })
  const pointerRef = useRef({ x: 0, y: 0, active: false })
  const [zoomed, setZoomed] = useState(null)
  const transitionRef = useRef(transition)
  transitionRef.current = transition
  const zoomAnims = useRef([])
  const zoomedRef = useRef(null)
  zoomedRef.current = zoomed

  const cfgRef = useRef({ speed, reach, fade })
  cfgRef.current = { speed, reach, fade }

  const items = images?.length ? images : []
  const count = items.length

  const seed = useCallback(() => {
    const { w: W, h: H } = sizeRef.current
    if (!W || !H) return
    partsRef.current = items.map((_im, i) => {
      const slot = LAYOUT[i % LAYOUT.length]
      const w = slot.w * slotSX
      const h = slot.h * slotSY
      const prev = partsRef.current[i]
      return {
        x: (slot.x / 100) * W - w / 2,
        y: prev ? prev.y : (slot.y / 100) * H - h / 2,
        dx: prev ? prev.dx : 0,
        dy: prev ? prev.dy : 0,
        z: prev ? prev.z : 0,
        targetZ: prev ? prev.targetZ : 0,
        w,
        h,
        mult: 0.65 + hash01(i) * 0.7,
      }
    })
  }, [count, slotSX, slotSY, items])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const measure = () => {
      sizeRef.current = { w: root.offsetWidth, h: root.offsetHeight }
      seed()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => ro.disconnect()
  }, [seed])

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const { w: W, h: H } = sizeRef.current
      if (!W || !H) return

      const cfg = cfgRef.current
      const drift = (Math.max(0, cfg.speed) / 50) * SPEED_REF
      const fadePx = (Math.max(0, Math.min(100, cfg.fade)) / 100) * (H / 2)
      const zi = zoomedRef.current
      const kOut = 1 - Math.exp(-8 * dt)

      for (let i = 0; i < partsRef.current.length; i += 1) {
        const a = partsRef.current[i]
        const node = nodesRef.current[i]
        if (!node) continue
        const frozen = zi === i

        if (!frozen) {
          a.y += drift * a.mult * dt
          const span = H + a.h
          if (a.y > H) a.y -= span
          else if (a.y < -a.h) a.y += span
        }

        // Repulsion frozen off (Originkit default); keep lerp for release settle
        a.dx += (0 - a.dx) * kOut
        a.dy += (0 - a.dy) * kOut

        const targetZ = frozen ? 1 : 0
        if (a.targetZ !== targetZ) {
          a.targetZ = targetZ
          zoomAnims.current[i]?.stop()
          const from = a.z
          const delta = targetZ - from
          zoomAnims.current[i] = animate(0, 1, {
            ...transitionRef.current,
            onUpdate: (t) => {
              a.z = from + delta * t
            },
            onComplete: () => {
              zoomAnims.current[i] = null
            },
          })
        }

        const baseX = a.x + a.dx
        const baseY = a.y + a.dy
        const z = a.z
        const px = baseX + ((W - a.w) / 2 - baseX) * z
        const py = baseY + ((H - a.h) / 2 - baseY) * z
        const fit = Math.min(
          ZOOM,
          (W * ZOOM_FIT) / Math.max(1, a.w),
          (H * ZOOM_FIT) / Math.max(1, a.h),
        )
        const s = 1 + (fit - 1) * z

        node.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${s})`
        node.style.zIndex = z > 0.001 ? '999' : '1'

        if (fadePx > 0) {
          const cy = a.y + a.h / 2
          const edge = Math.min(cy, H - cy)
          const o = Math.max(0, Math.min(1, edge / fadePx))
          node.style.opacity = `${o + (1 - o) * z}`
        } else {
          node.style.opacity = '1'
        }
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      zoomAnims.current.forEach((a) => a?.stop())
    }
  }, [])

  const onPointerMove = (e) => {
    const root = rootRef.current
    if (!root) return
    const r = root.getBoundingClientRect()
    const sx = r.width ? root.offsetWidth / r.width : 1
    const sy = r.height ? root.offsetHeight / r.height : 1
    pointerRef.current = {
      x: (e.clientX - r.left) * sx,
      y: (e.clientY - r.top) * sy,
      active: true,
    }
  }

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        pointerRef.current.active = false
      }}
      onClick={() => {
        if (zoomed !== null) setZoomed(null)
      }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background,
        isolation: 'isolate',
        touchAction: 'none',
        ...style,
      }}
    >
      {items.map((im, i) => {
        const slot = LAYOUT[i % LAYOUT.length]
        const w = slot.w * slotSX
        const h = slot.h * slotSY
        const isZoom = zoomed === i
        const link = im.link || ''

        const activate = (e) => {
          e?.stopPropagation()
          if (isZoom && link) {
            if (link.startsWith('/')) navigate(link)
            else window.open(link, '_blank', 'noopener')
            return
          }
          if (zoomed !== null) {
            setZoomed(null)
            return
          }
          setZoomed(i)
        }

        return (
          <div
            key={`${im.src}-${i}`}
            ref={(n) => {
              nodesRef.current[i] = n
            }}
            onClick={activate}
            role="button"
            tabIndex={0}
            aria-pressed={isZoom}
            aria-label={im.alt || 'Gallery image'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                activate(e)
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: w,
              height: h,
              clipPath: roundedClip(w, h, rounded),
              cursor: 'pointer',
              userSelect: 'none',
              background: 'rgba(248, 244, 238, 0.06)',
              filter: isZoom
                ? 'drop-shadow(0 28px 36px rgba(0,0,0,0.5))'
                : 'drop-shadow(0 10px 16px rgba(0,0,0,0.32))',
              willChange: 'transform',
            }}
          >
            {im.src ? (
              <img
                src={im.src}
                alt=""
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
