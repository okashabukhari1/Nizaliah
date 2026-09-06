/**
 * Bottle fades in on the hero's last frame (as if from behind the scene),
 * then travels down (shrinking) into the JANAN SPORT card.
 *
 * Scroll down → appear in place on last frame
 * Scroll up → fade out in place
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useJourney } from '../hooks/JourneyContext'
import {
  measureRect,
  sampleKeyframes,
  clamp,
} from '../utils/bottlePosition'

gsap.registerPlugin(ScrollTrigger)

export const BOTTLE_SRC = '/images/bottel-image.png'

const DEBUG =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debug')

/** Progress window where bottle fades in/out on the last frame */
const REVEAL_START = 0.9
const REVEAL_END = 1

function slotSize(rect, fallbackW, fallbackH) {
  if (!rect) return { w: fallbackW, h: fallbackH }
  return {
    w: Math.max(40, rect.width),
    h: Math.max(40, rect.height),
  }
}

function heroBottleSize(vw, vh) {
  const h = vh * 1.05
  const w = Math.min(vw * 0.88, h * 0.58, 560)
  return { w, h }
}

export default function BottleTraveler({
  reducedMotion = false,
  sequenceProgress = 0,
}) {
  const { getRefs } = useJourney()
  const wrapRef = useRef(null)
  const landedRef = useRef(false)
  const seqRef = useRef(sequenceProgress)
  const travelProgressRef = useRef(0)
  const [landed, setLanded] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [ready, setReady] = useState(false)

  seqRef.current = sequenceProgress

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('nizaliah:bottle-landed', { detail: { landed } }),
    )
  }, [landed])

  useEffect(() => {
    const img = new Image()
    img.onload = () => setReady(true)
    img.onerror = () => setReady(true)
    img.src = BOTTLE_SRC
  }, [])

  /**
   * Appear in place on the last frame (from behind the scene), not from above.
   * Scroll down → fade/scale in at center
   * Scroll up → fade out in place (back into the frame)
   */
  const applyHeroPark = (seq) => {
    const wrap = wrapRef.current
    if (!wrap) return

    // If already traveling down the page, don't fight travel
    if (travelProgressRef.current > 0.01 && seq >= 0.98) return

    const { heroSlot } = getRefs()
    const hero = measureRect(heroSlot)
    const vw = window.innerWidth
    const vh = window.innerHeight
    const size = heroBottleSize(vw, vh)

    const x = hero?.x ?? vw * 0.5
    const y = hero?.y ?? vh * 0.5
    const w = hero?.width && hero.width > 100 ? hero.width : size.w
    const h = hero?.height && hero.height > 100 ? hero.height : size.h

    const t = clamp(
      (seq - REVEAL_START) / (REVEAL_END - REVEAL_START),
      0,
      1,
    )
    const eased = t * t * (3 - 2 * t)

    gsap.set(wrap, {
      left: x,
      top: y,
      xPercent: -50,
      yPercent: -50,
      width: w,
      height: h,
      rotate: 0,
      scale: 0.94 + eased * 0.06,
      autoAlpha: eased < 0.02 ? 0 : eased,
      force3D: true,
    })

    if (DEBUG) {
      setDebugInfo({
        seq: Number(seq.toFixed(3)),
        progress: 0,
        phase: 'hero-park',
        bottle: {
          x: Math.round(x),
          y: Math.round(y),
          w: Math.round(w),
          h: Math.round(h),
          t: Number(eased.toFixed(3)),
        },
        target: null,
      })
    }
  }

  useEffect(() => {
    if (reducedMotion) return
    applyHeroPark(sequenceProgress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequenceProgress, getRefs, reducedMotion, ready])

  useEffect(() => {
    if (reducedMotion || !ready) return undefined

    const wrap = wrapRef.current
    if (!wrap) return undefined

    const mobile = window.matchMedia('(max-width: 768px)').matches

    const buildKeyframes = () => {
      const { heroSlot, waypointSlot, midSlot, productSlot } = getRefs()
      const heroR = measureRect(heroSlot)
      const wpR = measureRect(waypointSlot)
      const midR = measureRect(midSlot)
      const prodR = measureRect(productSlot)

      const vw = window.innerWidth
      const vh = window.innerHeight
      const size = heroBottleSize(vw, vh)

      const hero = heroR || {
        x: vw * 0.5,
        y: vh * 0.5,
        width: size.w,
        height: size.h,
      }

      const wp = wpR || {
        x: vw * 0.62,
        y: vh * 0.5,
        width: size.w * 0.4,
        height: size.h * 0.4,
      }

      const mid = midR || {
        x: vw * 0.5,
        y: vh * 0.48,
        width: size.w * 0.26,
        height: size.h * 0.26,
      }

      const prod = prodR || {
        x: vw * 0.5,
        y: vh * 0.45,
        width: size.w * 0.2,
        height: size.h * 0.2,
      }

      const rot = mobile ? 0 : 1
      const hs = slotSize(hero, size.w, size.h)
      const ws = slotSize(wp, hs.w * 0.4, hs.h * 0.4)
      const ms = slotSize(mid, hs.w * 0.26, hs.h * 0.26)
      const ps = slotSize(prod, hs.w * 0.2, hs.h * 0.2)

      return [
        { p: 0, x: hero.x, y: hero.y, w: hs.w, h: hs.h, rotate: 0 },
        { p: 0.28, x: wp.x, y: wp.y, w: ws.w, h: ws.h, rotate: -2 * rot },
        { p: 0.55, x: mid.x, y: mid.y, w: ms.w, h: ms.h, rotate: 3 * rot },
        {
          p: 0.82,
          x: prod.x,
          y: prod.y - 12,
          w: ps.w * 1.04,
          h: ps.h * 1.04,
          rotate: 0,
        },
        { p: 1, x: prod.x, y: prod.y, w: ps.w, h: ps.h, rotate: 0 },
      ]
    }

    const applyTravel = (progress) => {
      const seq = seqRef.current
      const p = clamp(progress, 0, 1)
      travelProgressRef.current = p

      // Still inside frame sequence, or travel hasn't started — park controls bottle
      if (seq < 0.98 || p <= 0.001) {
        applyHeroPark(seq)
        if (landedRef.current) {
          landedRef.current = false
          setLanded(false)
        }
        return
      }

      const sample = sampleKeyframes(buildKeyframes(), p)
      // Hide once the bottle reaches the product card; show again when scrolling up
      const shouldLand = p >= 0.9

      gsap.set(wrap, {
        left: sample.x,
        top: sample.y,
        xPercent: -50,
        yPercent: -50,
        width: sample.w,
        height: sample.h,
        rotate: sample.rotate,
        scale: 1,
        autoAlpha: shouldLand ? 0 : 1,
        force3D: true,
      })

      if (shouldLand !== landedRef.current) {
        landedRef.current = shouldLand
        setLanded(shouldLand)
      }

      if (DEBUG) {
        const { productSlot } = getRefs()
        const pr = measureRect(productSlot)
        setDebugInfo({
          seq: Number(seq.toFixed(3)),
          progress: Number(p.toFixed(3)),
          phase: 'travel',
          bottle: {
            x: Math.round(sample.x),
            y: Math.round(sample.y),
            w: Math.round(sample.w),
            h: Math.round(sample.h),
          },
          target: pr
            ? {
                x: Math.round(pr.x),
                y: Math.round(pr.y),
                w: Math.round(pr.width),
                h: Math.round(pr.height),
              }
            : null,
        })
      }
    }

    const st = ScrollTrigger.create({
      id: 'bottle-journey',
      trigger: '#editorial',
      start: 'top bottom',
      endTrigger: '#products',
      end: 'bottom bottom',
      scrub: 0.65,
      invalidateOnRefresh: true,
      onUpdate: (self) => applyTravel(self.progress),
      onRefresh: (self) => applyTravel(self.progress),
    })

    const onResize = () => applyTravel(st.progress)
    window.addEventListener('resize', onResize)
    applyHeroPark(seqRef.current)

    return () => {
      st.kill()
      window.removeEventListener('resize', onResize)
      travelProgressRef.current = 0
      gsap.killTweensOf(wrap)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getRefs, ready, reducedMotion])

  if (reducedMotion) return null

  return (
    <>
      <div
        ref={wrapRef}
        id="bottle-journey-layer"
        aria-hidden
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          width: 'min(88vw, 560px)',
          height: '105svh',
          zIndex: 55,
          pointerEvents: 'none',
          willChange: 'transform, width, height, opacity',
          transformOrigin: 'center center',
          outline: DEBUG ? '2px solid #D4AF37' : 'none',
          opacity: 0,
        }}
      >
        <img
          src={BOTTLE_SRC}
          alt=""
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {DEBUG && debugInfo && (
        <div
          style={{
            position: 'fixed',
            left: 12,
            bottom: 12,
            zIndex: 9999,
            padding: '10px 12px',
            background: 'rgba(56,42,64,0.92)',
            color: '#F8F4EE',
            fontFamily: 'monospace',
            fontSize: 11,
            lineHeight: 1.45,
            pointerEvents: 'none',
          }}
        >
          <div>phase: {debugInfo.phase}</div>
          <div>seq: {debugInfo.seq}</div>
          <div>travel: {debugInfo.progress}</div>
          {debugInfo.bottle && (
            <div>
              bottle: {debugInfo.bottle.w}×{debugInfo.bottle.h}
              {debugInfo.bottle.t != null ? ` t=${debugInfo.bottle.t}` : ''}
            </div>
          )}
        </div>
      )}
    </>
  )
}
