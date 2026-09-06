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

/**
 * Flatten scenes into one ordered URL list, sampling with `step`.
 * Failed / missing frames stay null — painter holds the last good frame.
 */
export function createPlaylistLoader(playlist = SCENE_PLAYLIST, options = {}) {
  const { step = 2, onProgress, priorityCount = 40 } = options

  const entries = []
  playlist.forEach((scene) => {
    for (let i = 1; i <= scene.count; i += step) {
      entries.push({ sceneId: scene.id, index: i, url: frameUrl(scene, i) })
    }
  })

  const images = new Array(entries.length).fill(null)
  let loaded = 0
  let aborted = false
  let lastGood = null

  const loadOne = (slot) =>
    new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (!aborted) {
          images[slot] = img
          lastGood = img
          loaded += 1
          onProgress?.(loaded, entries.length)
        }
        resolve(img)
      }
      img.onerror = () => {
        // Missing / broken file — hold previous good frame at paint time
        loaded += 1
        onProgress?.(loaded, entries.length)
        resolve(null)
      }
      img.src = entries[slot].url
    })

  const start = async () => {
    const priority = Math.min(priorityCount, entries.length)
    await Promise.all(
      Array.from({ length: priority }, (_, s) => loadOne(s)),
    )

    const rest = []
    for (let s = priority; s < entries.length; s += 1) rest.push(loadOne(s))
    const chunk = 16
    for (let i = 0; i < rest.length; i += chunk) {
      if (aborted) break
      await Promise.all(rest.slice(i, i + chunk))
      await new Promise((r) => setTimeout(r, 0))
    }
    return images
  }

  const indexAt = (progress) => {
    const p = Math.min(1, Math.max(0, progress))
    if (entries.length <= 1) return 0
    return Math.min(
      entries.length - 1,
      Math.max(0, Math.floor(p * (entries.length - 1))),
    )
  }

  /** Prefer current frame; if missing, walk backward; else lastGood */
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

  return {
    entries,
    images,
    start,
    abort: () => {
      aborted = true
    },
    get length() {
      return entries.length
    },
    getFrameIndex: indexAt,
    getFrame,
  }
}
