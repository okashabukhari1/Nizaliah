/**
 * Measure a DOM element's center + size relative to the viewport.
 */
export function measureRect(el) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    width: r.width,
    height: r.height,
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
  }
}

/**
 * Convert a target image-slot rect into bottle overlay transform values.
 * Bottle overlay is fixed, centered with transform-origin center.
 */
export function rectToBottleTransform(rect, viewport = window) {
  if (!rect) return null
  const vw = viewport.innerWidth
  const vh = viewport.innerHeight
  return {
    x: rect.x - vw / 2,
    y: rect.y - vh / 2,
    width: rect.width,
    height: rect.height,
  }
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

/** Smoothstep for softer keyframe blends */
export function smoothstep(t) {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

/**
 * Interpolate between keyframe transforms keyed by progress 0–1.
 * keyframes: [{ p, x, y, scale, rotate, opacity }]
 */
export function sampleKeyframes(keyframes, progress) {
  const p = clamp(progress, 0, 1)
  if (p <= keyframes[0].p) return { ...keyframes[0] }
  if (p >= keyframes[keyframes.length - 1].p) {
    return { ...keyframes[keyframes.length - 1] }
  }

  let i = 0
  while (i < keyframes.length - 1 && keyframes[i + 1].p < p) i += 1

  const a = keyframes[i]
  const b = keyframes[i + 1]
  const t = smoothstep((p - a.p) / (b.p - a.p || 1))

  return {
    p,
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w ?? a.width ?? 0, b.w ?? b.width ?? 0, t),
    h: lerp(a.h ?? a.height ?? 0, b.h ?? b.height ?? 0, t),
    scale: lerp(a.scale ?? 1, b.scale ?? 1, t),
    rotate: lerp(a.rotate ?? 0, b.rotate ?? 0, t),
    opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t),
  }
}
