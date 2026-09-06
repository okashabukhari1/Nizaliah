import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const EASE_PRESETS = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
}

function parseTransition(t) {
  const dur = Math.max(0.05, (t && t.duration) || 0.5)
  let ease = 'cubic-bezier(0.44, 0, 0.56, 1)'
  if (t && Array.isArray(t.ease) && t.ease.length === 4) {
    ease = `cubic-bezier(${t.ease.join(', ')})`
  } else if (t && typeof t.ease === 'string' && EASE_PRESETS[t.ease]) {
    ease = EASE_PRESETS[t.ease]
  } else if (t && t.type === 'spring') {
    ease = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
  return { dur, ease }
}

/**
 * Magnetic Carousel — macOS-dock style bars that magnify near the cursor.
 * Click to expand; click again / backdrop to collapse.
 */
export default function MagneticCarousel({
  items = [],
  collapsedWidth = 88,
  hoverWidth = 180,
  collapsedHeight = 340,
  hoverHeight = 400,
  openSize = 480,
  gap = 14,
  influence = 200,
  blur = 2,
  transition = { type: 'tween', duration: 0.3, ease: 'easeInOut' },
  renderSlot,
}) {
  const count = items.length
  const containerRef = useRef(null)
  const [factors, setFactors] = useState(() => items.map(() => 0))
  const [open, setOpen] = useState(null)
  const [closing, setClosing] = useState(false)
  const [dims, setDims] = useState({
    collapsedWidth,
    hoverWidth,
    collapsedHeight,
    hoverHeight,
    openSize,
    gap,
    influence,
  })

  const targetRef = useRef(items.map(() => 0))
  const curRef = useRef(items.map(() => 0))
  const loopRef = useRef(0)
  const closeTimer = useRef(0)

  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia('(max-width: 768px)').matches
      const narrow = window.matchMedia('(max-width: 480px)').matches
      setDims({
        collapsedWidth: narrow ? 42 : mobile ? 56 : collapsedWidth,
        hoverWidth: narrow ? 96 : mobile ? 120 : hoverWidth,
        collapsedHeight: mobile ? 260 : collapsedHeight,
        hoverHeight: mobile ? 300 : hoverHeight,
        openSize: narrow ? Math.min(openSize, window.innerWidth - 48) : openSize,
        gap: mobile ? 8 : gap,
        influence: mobile ? 120 : influence,
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [
    collapsedWidth,
    hoverWidth,
    collapsedHeight,
    hoverHeight,
    openSize,
    gap,
    influence,
  ])

  useEffect(() => {
    targetRef.current = items.map(() => 0)
    curRef.current = items.map(() => 0)
    setFactors(items.map(() => 0))
    setOpen(null)
  }, [count])

  useEffect(
    () => () => {
      cancelAnimationFrame(loopRef.current)
      clearTimeout(closeTimer.current)
    },
    [],
  )

  const startLoop = () => {
    if (loopRef.current) return
    const step = () => {
      const tgt = targetRef.current
      const cur = curRef.current
      let moving = false
      for (let i = 0; i < cur.length; i += 1) {
        const d = (tgt[i] ?? 0) - cur[i]
        if (Math.abs(d) > 0.001) {
          cur[i] += d * 0.2
          moving = true
        } else {
          cur[i] = tgt[i] ?? 0
        }
      }
      setFactors([...cur])
      loopRef.current = moving ? requestAnimationFrame(step) : 0
    }
    loopRef.current = requestAnimationFrame(step)
  }

  const setTargetFromCursor = (clientX) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = clientX - rect.left
    const n = items.length
    const totalBase = n * dims.collapsedWidth + (n - 1) * dims.gap
    const startX = (rect.width - totalBase) / 2
    targetRef.current = items.map((_, i) => {
      const center =
        startX + i * (dims.collapsedWidth + dims.gap) + dims.collapsedWidth / 2
      const dist = Math.abs(cx - center)
      const f = Math.max(0, 1 - dist / dims.influence)
      return f * f * (3 - 2 * f)
    })
    startLoop()
  }

  const onMove = (e) => {
    if (open !== null) return
    setTargetFromCursor(e.clientX)
  }

  const onLeave = () => {
    if (open !== null) return
    targetRef.current = items.map(() => 0)
    startLoop()
  }

  const { dur, ease } = parseTransition(transition)

  const close = () => {
    targetRef.current = items.map(() => 0)
    curRef.current = items.map(() => 0)
    setFactors(items.map(() => 0))
    setClosing(true)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setClosing(false), dur * 1000)
    setOpen(null)
  }

  const sizeFor = (i) => {
    if (open !== null) {
      return i === open
        ? { width: dims.openSize, height: dims.openSize }
        : { width: dims.collapsedWidth, height: dims.collapsedHeight }
    }
    const f = factors[i] ?? 0
    return {
      width:
        dims.collapsedWidth + (dims.hoverWidth - dims.collapsedWidth) * f,
      height:
        dims.collapsedHeight + (dims.hoverHeight - dims.collapsedHeight) * f,
    }
  }

  const openEase = `width ${dur}s ${ease}, height ${dur}s ${ease}, filter ${dur}s ${ease}, opacity ${dur}s ${ease}`
  const barTransition = open !== null || closing ? openEase : 'none'

  if (!count) return null

  return (
    <div
      ref={containerRef}
      className="relative flex w-full items-center justify-center overflow-x-auto overflow-y-visible py-6"
      style={{ gap: dims.gap, minHeight: dims.hoverHeight + 48 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="absolute inset-0 z-[1]"
        style={{ pointerEvents: open !== null ? 'auto' : 'none' }}
        onClick={close}
        aria-hidden
      />

      {items.map((item, i) => {
        const { width, height } = sizeFor(i)
        const blurred = open !== null && i !== open
        const isOpen = open === i

        return (
          <div
            key={item.id || item.src || i}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-label={item.name || `Item ${i + 1}`}
            onClick={(e) => {
              e.stopPropagation()
              if (open === i) close()
              else setOpen(i)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                if (open === i) close()
                else setOpen(i)
              }
            }}
            className="relative flex-none overflow-hidden"
            style={{
              width,
              height,
              cursor: 'pointer',
              transition: barTransition,
              willChange: 'width, height',
              zIndex: isOpen ? 3 : 2,
              filter: blurred ? `blur(${blur}px)` : 'none',
              opacity: blurred ? 0.55 : 1,
              backgroundColor: item.src
                ? 'transparent'
                : item.primary
                  ? '#221C16'
                  : `hsl(${(i * 360) / count}, 35%, 42%)`,
              backgroundImage: item.src ? `url(${item.src})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {typeof renderSlot === 'function' ? renderSlot(item, i, isOpen) : null}

            {isOpen && (item.name || item.href) && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] bg-gradient-to-t from-[#18140F]/90 via-[#18140F]/40 to-transparent px-4 pb-5 pt-16">
                {item.name && (
                  <p className="font-display text-2xl font-light tracking-wide text-[#F8F4EE]">
                    {item.name}
                  </p>
                )}
                {item.subtitle && (
                  <p className="mt-1 font-sans text-[10px] tracking-[0.28em] text-[#E8DCCB]/80">
                    {item.subtitle}
                  </p>
                )}
                {item.href && (
                  <Link
                    to={item.href}
                    onClick={(e) => e.stopPropagation()}
                    className="pointer-events-auto mt-4 inline-block font-sans text-[10px] tracking-[0.28em] text-[#D4AF37] no-underline"
                  >
                    DISCOVER →
                  </Link>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
