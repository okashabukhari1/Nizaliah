/**
 * Multi-scene frame playlist for the hero background.
 * Folders: /Scenes/Scene 1 … Scene 5 — ezgif-frame-001.png …
 */

export const SCENE_PLAYLIST = [
  { id: 1, folder: '/Scenes/Scene%201', count: 300 },
  { id: 2, folder: '/Scenes/Scene%202', count: 200 },
  { id: 3, folder: '/Scenes/Scene%203', count: 200 },
  { id: 4, folder: '/Scenes/Scene%204', count: 185 },
  { id: 5, folder: '/Scenes/Scene%205', count: 200 },
]

export function frameUrl(scene, index1Based) {
  const n = String(index1Based).padStart(3, '0')
  return `${scene.folder}/ezgif-frame-${n}.png`
}

/** Shared loaders survive React StrictMode remounts (avoids double-fetch). */
const sharedLoaders = new Map()

/**
 * Flatten scenes into one ordered URL list, sampling with `step`.
 * Failed / missing frames stay null — painter holds the last good frame.
 */
export function createPlaylistLoader(playlist = SCENE_PLAYLIST, options = {}) {
  const {
    step = 2,
    onProgress,
    priorityCount = 40,
    concurrency = 6,
  } = options

  const cacheKey = `${step}:${playlist.map((s) => `${s.id}-${s.count}`).join('|')}`
  const existing = sharedLoaders.get(cacheKey)
  if (existing) {
    if (onProgress) {
      existing.listeners.add(onProgress)
      onProgress(existing.loaded, existing.entries.length)
      if (existing.done) onProgress(existing.entries.length, existing.entries.length)
    }
    return existing.api
  }

  const entries = []
  playlist.forEach((scene) => {
    for (let i = 1; i <= scene.count; i += step) {
      entries.push({ sceneId: scene.id, index: i, url: frameUrl(scene, i) })
    }
  })

  const images = new Array(entries.length).fill(null)
  const listeners = new Set()
  if (onProgress) listeners.add(onProgress)

  let loaded = 0
  let lastGood = null
  let done = false
  let startPromise = null
  let lastProgressEmit = 0

  const emitProgress = (force = false) => {
    const now = performance.now()
    if (!force && now - lastProgressEmit < 50) return
    lastProgressEmit = now
    listeners.forEach((fn) => {
      try {
        fn(loaded, entries.length)
      } catch {
        /* ignore listener errors */
      }
    })
  }

  const loadOne = (slot) =>
    new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      const finish = (ok) => {
        if (ok) {
          images[slot] = img
          lastGood = img
        }
        loaded += 1
        emitProgress()
        resolve(ok ? img : null)
      }
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(() => finish(true)).catch(() => finish(true))
        } else {
          finish(true)
        }
      }
      img.onerror = () => finish(false)
      img.src = entries[slot].url
    })

  const runPool = async (slots) => {
    let cursor = 0
    const workers = Array.from(
      { length: Math.min(concurrency, slots.length) },
      async () => {
        while (cursor < slots.length) {
          const slot = slots[cursor]
          cursor += 1
          await loadOne(slot)
          // Yield so the loader UI and main thread stay responsive
          await new Promise((r) => setTimeout(r, 0))
        }
      },
    )
    await Promise.all(workers)
  }

  const start = () => {
    if (startPromise) return startPromise
    startPromise = (async () => {
      const priority = Math.min(priorityCount, entries.length)
      const prioritySlots = Array.from({ length: priority }, (_, s) => s)
      await runPool(prioritySlots)
      emitProgress(true)

      if (priority < entries.length) {
        const restSlots = Array.from(
          { length: entries.length - priority },
          (_, i) => i + priority,
        )
        await runPool(restSlots)
      }

      done = true
      emitProgress(true)
      return images
    })()
    return startPromise
  }

  const indexAt = (progress) => {
    const p = Math.min(1, Math.max(0, progress))
    if (entries.length <= 1) return 0
    return Math.min(
      entries.length - 1,
      Math.max(0, Math.floor(p * (entries.length - 1))),
    )
  }

  const getFrame = (progress) => {
    const idx = indexAt(progress)
    if (images[idx]) return images[idx]
    for (let i = idx - 1; i >= 0; i -= 1) {
      if (images[i]) return images[i]
    }
    for (let i = idx + 1; i < images.length; i += 1) {
      if (images[i]) return images[i]
    }
    return lastGood
  }

  const api = {
    entries,
    images,
    start,
    abort: () => {
      // Keep shared cache; only detach this consumer's listener
      if (onProgress) listeners.delete(onProgress)
    },
    get length() {
      return entries.length
    },
    getFrameIndex: indexAt,
    getFrame,
  }

  sharedLoaders.set(cacheKey, {
    api,
    entries,
    images,
    listeners,
    get loaded() {
      return loaded
    },
    get done() {
      return done
    },
    step,
  })

  return api
}

/** Critical stills preloaded during the intro (non-scene assets). */
export const CRITICAL_STILLS = [
  '/images/logo-dark.png',
  '/images/logo-white.png',
  '/images/bottel-image.png',
  '/images/janan-sport.png',
  '/images/luxury-intense.png',
  '/images/amber-veil.jpg',
  '/images/royal-oud.jpg',
  '/images/noir-musk.jpg',
  '/images/rose-eclat.jpg',
  '/images/midnight-mystery.jpg',
  '/images/place-texture.jpg',
]

export function preloadImages(urls, onProgress) {
  const list = [...new Set(urls.filter(Boolean))]
  if (!list.length) {
    onProgress?.(1, 1)
    return Promise.resolve()
  }
  let loaded = 0
  return Promise.all(
    list.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image()
          img.decoding = 'async'
          const done = () => {
            loaded += 1
            onProgress?.(loaded, list.length)
            resolve()
          }
          img.onload = done
          img.onerror = done
          img.src = src
        }),
    ),
  )
}
