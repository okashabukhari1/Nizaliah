import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import MechKeyboard, { codeToInput } from './MechKeyboard'

const INTRO_ID = 'niz-intro'
const READY_EVENT = 'nizaliah:intro-ready'
const PROGRESS_EVENT = 'nizaliah:intro-progress'
const TARGET = 'ENTER'

const STATUS_WORDS = ['COMPOSING', 'BLENDING', 'SETTLING', 'READY']

/**
 * Two-phase intro:
 * 1) Logo + 0→100% load bar while the site loads
 * 2) After 100%, reveal the keyboard gate (type ENTER)
 */
export default function IntroLoader() {
  const { pathname } = useLocation()
  const progressRef = useRef(0)
  const readyRef = useRef(false)
  const dismissedRef = useRef(false)
  const typedRef = useRef('')
  const gateShownRef = useRef(false)
  const [active, setActive] = useState(() => {
    if (typeof document === 'undefined') return false
    const el = document.getElementById(INTRO_ID)
    return Boolean(el && !el.classList.contains('is-done'))
  })
  const [gateLive, setGateLive] = useState(false)

  const applyTyped = useCallback((next) => {
    const clipped = next.slice(0, 12)
    typedRef.current = clipped

    const field = document.getElementById('niz-intro-typed')
    if (field) {
      field.textContent = clipped || 'TYPE ENTER'
      field.classList.toggle('is-empty', !clipped)
      field.classList.toggle('is-match', clipped.toUpperCase() === TARGET)
    }
  }, [])

  useEffect(() => {
    const el = document.getElementById(INTRO_ID)
    if (!el || el.classList.contains('is-done')) {
      setActive(false)
      return undefined
    }

    setActive(true)
    setGateLive(false)
    progressRef.current = 0
    readyRef.current = false
    dismissedRef.current = false
    gateShownRef.current = false
    applyTyped('')

    const bar = el.querySelector('#niz-intro-bar')
    const pct = el.querySelector('#niz-intro-pct')
    const status = el.querySelector('#niz-intro-status')
    const orb1 = el.querySelector('[data-orb="1"]')
    const orb2 = el.querySelector('[data-orb="2"]')
    const glow = el.querySelector('[data-glow]')
    const particleHost = el.querySelector('[data-particles]')
    const track = el.querySelector('.niz-intro-track')
    const meta = el.querySelector('.niz-intro-meta')
    const hint = el.querySelector('.niz-intro-hint')
    const particles = []
    if (particleHost) {
      particleHost.innerHTML = ''
      for (let i = 0; i < 14; i += 1) {
        const p = document.createElement('span')
        p.className = 'niz-particle'
        p.style.left = `${Math.random() * 100}%`
        p.style.top = `${Math.random() * 100}%`
        p.style.width = `${2 + Math.random() * 3}px`
        p.style.height = p.style.width
        particleHost.appendChild(p)
        particles.push(p)
      }
    }

    const ctx = gsap.context(() => {
      gsap.set(
        [
          '.niz-intro-logo',
          '.niz-intro-sub',
          '.niz-intro-track',
          '.niz-intro-meta',
          '.niz-intro-hint',
          '.niz-intro-typed',
          '.niz-intro-orb',
          '.niz-particle',
          '#niz-intro-keyboard',
        ],
        { autoAlpha: 0 },
      )

      if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })

      // Phase 1: loading UI only (no keyboard yet)
      gsap
        .timeline()
        .fromTo(
          '.niz-intro-logo',
          { scale: 0.82, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.75, ease: 'power3.out' },
        )
        .to('.niz-intro-sub', { autoAlpha: 1, duration: 0.45 }, '-=0.25')
        .to(
          ['.niz-intro-track', '.niz-intro-meta'],
          { autoAlpha: 1, duration: 0.45 },
          '-=0.2',
        )
        .to('.niz-intro-hint', { autoAlpha: 0.85, duration: 0.4 }, '-=0.1')

      if (particles.length) {
        gsap.to('.niz-particle', {
          autoAlpha: 0.35,
          duration: 1.2,
          stagger: 0.04,
          ease: 'power1.out',
        })
        particles.forEach((p, i) => {
          gsap.to(p, {
            y: `+=${12 + (i % 5) * 6}`,
            duration: 2.8 + (i % 4) * 0.45,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            delay: i * 0.08,
          })
        })
      }

      if (orb1 && orb2) {
        gsap.set([orb1, orb2], {
          autoAlpha: 1,
          left: '50%',
          top: '48%',
          xPercent: -50,
          yPercent: -50,
        })
        gsap.to(orb1, { rotation: 360, duration: 20, repeat: -1, ease: 'none' })
        gsap.to(orb2, { rotation: -360, duration: 32, repeat: -1, ease: 'none' })
      }
    }, el)

    const onPointerMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const dx = (px - 0.5) * 22
      const dy = (py - 0.5) * 14

      if (glow) {
        gsap.to(glow, {
          x: dx * 0.9,
          y: dy * 0.75,
          duration: 1.35,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      particles.forEach((p, i) => {
        const factor = ((i % 5) + 1) * 0.18
        gsap.to(p, {
          x: dx * factor,
          y: dy * factor * 0.65,
          duration: 1.4,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      })
    }

    el.addEventListener('pointermove', onPointerMove)

    const setProgress = (value, { force = false } = {}) => {
      const next = Math.min(1, Math.max(0, value))
      const p = force ? next : Math.max(progressRef.current, next)
      progressRef.current = p
      const percent = Math.round(p * 100)
      if (bar) {
        gsap.to(bar, {
          scaleX: p,
          duration: force ? 0.45 : 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
          transformOrigin: 'left center',
        })
      }
      if (pct) pct.textContent = `${percent}%`
      if (status && !readyRef.current) {
        const idx = Math.min(
          STATUS_WORDS.length - 1,
          Math.floor(p * (STATUS_WORDS.length - 0.01)),
        )
        status.textContent = STATUS_WORDS[idx]
      }
    }

    // Soft crawl so the bar moves while assets load (real load can pull ahead)
    const tick = gsap.to(
      { v: 0 },
      {
        v: 0.92,
        duration: 8,
        ease: 'power1.out',
        onUpdate() {
          if (readyRef.current) return
          setProgress(this.targets()[0].v)
        },
      },
    )

    const showKeyboardGate = () => {
      if (gateShownRef.current || dismissedRef.current) return
      gateShownRef.current = true
      setGateLive(true)

      if (hint) hint.textContent = 'TYPE ENTER ON YOUR KEYBOARD'
      const field = document.getElementById('niz-intro-typed')
      if (field && !typedRef.current) {
        field.textContent = 'TYPE ENTER'
        field.classList.add('is-empty')
      }

      gsap
        .timeline()
        .to([track, meta], {
          autoAlpha: 0,
          y: -8,
          duration: 0.4,
          ease: 'power2.in',
        })
        .to(
          '#niz-intro-keyboard',
          { autoAlpha: 1, duration: 0.65, ease: 'power2.out' },
          '-=0.1',
        )
        .to('.niz-intro-typed', { autoAlpha: 1, duration: 0.45 }, '-=0.3')
        .to(hint, { autoAlpha: 0.9, duration: 0.4 }, '-=0.2')
    }

    const onProgress = (e) => {
      const ratio = Number(e.detail?.ratio)
      if (!Number.isFinite(ratio) || readyRef.current) return
      setProgress(Math.min(0.99, ratio))
    }

    const dismiss = () => {
      if (dismissedRef.current) return
      dismissedRef.current = true
      readyRef.current = true
      tick.kill()
      setProgress(1, { force: true })
      if (status) status.textContent = 'READY'

      gsap.to(el, {
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        delay: 0.05,
        onComplete: () => {
          el.classList.add('is-done')
          el.setAttribute('aria-busy', 'false')
          setActive(false)
          setGateLive(false)
          el.remove()
        },
      })
    }

    const tryEnter = () => {
      if (!readyRef.current || dismissedRef.current) return false
      if (typedRef.current.toUpperCase() === TARGET) {
        dismiss()
        return true
      }
      return false
    }

    const onReady = () => {
      if (readyRef.current) return
      readyRef.current = true
      tick.kill()
      setProgress(1, { force: true })
      if (status) status.textContent = 'READY'
      // Brief beat at 100%, then keyboard gate
      window.setTimeout(showKeyboardGate, 380)
    }

    const handleInput = (code) => {
      if (dismissedRef.current || !gateShownRef.current) return

      const input = codeToInput(code)
      if (!input) return

      if (input === 'Enter') {
        if (!readyRef.current) return
        if (typedRef.current.toUpperCase() === TARGET) dismiss()
        return
      }

      if (input === 'Backspace') {
        applyTyped(typedRef.current.slice(0, -1))
        return
      }

      if (input === ' ') return
      if (!readyRef.current) return

      const next = (typedRef.current + input).slice(0, 12)
      applyTyped(next)
      if (next.toUpperCase() === TARGET) {
        window.setTimeout(() => tryEnter(), 120)
      }
    }

    el._nizHandleInput = handleInput

    window.addEventListener(PROGRESS_EVENT, onProgress)
    window.addEventListener(READY_EVENT, onReady)

    // Failsafe if load signal never arrives
    const failsafe = window.setTimeout(
      onReady,
      pathname !== '/' ? 800 : 14000,
    )

    return () => {
      tick.kill()
      ctx.revert()
      el.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener(PROGRESS_EVENT, onProgress)
      window.removeEventListener(READY_EVENT, onReady)
      window.clearTimeout(failsafe)
      delete el._nizHandleInput
    }
  }, [pathname, applyTyped])

  const onStrike = useCallback(({ code, fromPointer }) => {
    const el = document.getElementById(INTRO_ID)
    el?._nizHandleInput?.(code)
    void fromPointer
  }, [])

  const keyboardMount =
    typeof document !== 'undefined'
      ? document.getElementById('niz-intro-keyboard')
      : null

  return active && gateLive && keyboardMount
    ? createPortal(
        <MechKeyboard
          finish="metal"
          caseColor="#4A4038"
          keyColor="#3A322C"
          modColor="#2E2822"
          pressColor="#D4AF37"
          legendColor="#F8F4EE"
          modLegendColor="#E8DCCB"
          tilt={16}
          size={92}
          stiffness={18}
          gap={5}
          shadows={false}
          sound
          soundOptions={{ pitch: 11, volume: 7 }}
          followPointer={false}
          strength={0}
          onStrike={onStrike}
          style={{ width: '100%', height: '100%' }}
        />,
        keyboardMount,
      )
    : null
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
