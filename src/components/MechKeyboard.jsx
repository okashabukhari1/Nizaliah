import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const POLISHED_METAL_MATCAP =
  'https://framerusercontent.com/images/Wkm2ineJ1Md7Xb1oyjF6dqbAw.png'

let matcapTexture = null
let matcapPending = null

function loadMatcap() {
  if (matcapTexture) return Promise.resolve(matcapTexture)
  if (matcapPending) return matcapPending
  matcapPending = new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      POLISHED_METAL_MATCAP,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        matcapTexture = texture
        resolve(texture)
      },
      undefined,
      () => resolve(null),
    )
  })
  return matcapPending
}

const DEFAULTS = {
  finish: 'metal',
  caseColor: '#4A4B4D',
  keyColor: '#3B3C3E',
  modColor: '#3D3D3D',
  pressColor: '#555555',
  legendColor: '#FFFFFF',
  modLegendColor: '#FFFFFF',
  tilt: 17,
  size: 90,
  stiffness: 20,
  gap: 5,
  shadows: true,
  sound: true,
  soundOptions: { pitch: 10, volume: 8 },
  followPointer: true,
  strength: 9,
}

function clamp(v, lo, hi, fallback) {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback
  return Math.max(lo, Math.min(hi, n))
}

function settingsFor(cfg) {
  const so = cfg.soundOptions || DEFAULTS.soundOptions
  return {
    tilt: 0.28 + clamp(cfg.tilt, 1, 20, DEFAULTS.tilt) * 0.045,
    zoom: 100 / clamp(cfg.size, 40, 160, DEFAULTS.size),
    stiffness: 120 + clamp(cfg.stiffness, 1, 20, DEFAULTS.stiffness) * 55,
    gap: 0.02 + clamp(cfg.gap, 0, 20, DEFAULTS.gap) * 0.006,
    volume: clamp(so.volume, 0, 20, 8) * 0.011,
    pitch: 90 + clamp(so.pitch, 1, 20, 10) * 22,
    lean: clamp(cfg.strength, 0, 20, DEFAULTS.strength) * 0.014,
  }
}

const ROWS = [
  [
    ['`', 'Backquote', 1],
    ['1', 'Digit1', 1],
    ['2', 'Digit2', 1],
    ['3', 'Digit3', 1],
    ['4', 'Digit4', 1],
    ['5', 'Digit5', 1],
    ['6', 'Digit6', 1],
    ['7', 'Digit7', 1],
    ['8', 'Digit8', 1],
    ['9', 'Digit9', 1],
    ['0', 'Digit0', 1],
    ['-', 'Minus', 1],
    ['=', 'Equal', 1],
    ['⌫', 'Backspace', 2],
  ],
  [
    ['⇥', 'Tab', 1.5],
    ['Q', 'KeyQ', 1],
    ['W', 'KeyW', 1],
    ['E', 'KeyE', 1],
    ['R', 'KeyR', 1],
    ['T', 'KeyT', 1],
    ['Y', 'KeyY', 1],
    ['U', 'KeyU', 1],
    ['I', 'KeyI', 1],
    ['O', 'KeyO', 1],
    ['P', 'KeyP', 1],
    ['[', 'BracketLeft', 1],
    [']', 'BracketRight', 1],
    ['\\', 'Backslash', 1.5],
  ],
  [
    ['⇪', 'CapsLock', 1.75],
    ['A', 'KeyA', 1],
    ['S', 'KeyS', 1],
    ['D', 'KeyD', 1],
    ['F', 'KeyF', 1],
    ['G', 'KeyG', 1],
    ['H', 'KeyH', 1],
    ['J', 'KeyJ', 1],
    ['K', 'KeyK', 1],
    ['L', 'KeyL', 1],
    [';', 'Semicolon', 1],
    ["'", 'Quote', 1],
    ['⏎', 'Enter', 2.25],
  ],
  [
    ['⇧', 'ShiftLeft', 2.25],
    ['Z', 'KeyZ', 1],
    ['X', 'KeyX', 1],
    ['C', 'KeyC', 1],
    ['V', 'KeyV', 1],
    ['B', 'KeyB', 1],
    ['N', 'KeyN', 1],
    ['M', 'KeyM', 1],
    [',', 'Comma', 1],
    ['.', 'Period', 1],
    ['/', 'Slash', 1],
    ['⇧', 'ShiftRight', 2.75],
  ],
  [
    ['ctrl', 'ControlLeft', 1.25],
    ['⌘', 'MetaLeft', 1.25],
    ['alt', 'AltLeft', 1.25],
    ['', 'Space', 6.25],
    ['alt', 'AltRight', 1.25],
    ['⌘', 'MetaRight', 1.25],
    ['fn', 'ContextMenu', 1.25],
    ['ctrl', 'ControlRight', 1.25],
  ],
]

const UNITS_WIDE = 15
const ROW_COUNT = ROWS.length
const CAP_HEIGHT = 0.42
const CASE_PAD = 0.55
const CASE_W = UNITS_WIDE + CASE_PAD * 2
const CASE_D = ROW_COUNT + CASE_PAD * 2
const TRAVEL = 0.21

function roundedRect(w, h, r) {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  const rr = Math.min(r, w / 2, h / 2)
  shape.moveTo(x + rr, y)
  shape.lineTo(x + w - rr, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + rr)
  shape.lineTo(x + w, y + h - rr)
  shape.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  shape.lineTo(x + rr, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - rr)
  shape.lineTo(x, y + rr)
  shape.quadraticCurveTo(x, y, x + rr, y)
  return shape
}

function boxGeometry(w, d, h, r, bevel) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
    depth: Math.max(0.001, h - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 2,
    curveSegments: 4,
  })
  geo.rotateX(-Math.PI / 2)
  geo.computeBoundingBox()
  const box = geo.boundingBox
  geo.translate(0, -box.min.y, 0)
  geo.computeVertexNormals()
  return geo
}

function srcOf(image) {
  if (!image) return ''
  if (typeof image === 'string') return image
  return image.src || image.url || ''
}

const wrapCache = new Map()

function loadWrap(src) {
  const hit = wrapCache.get(src)
  if (hit) return hit
  const pending = new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        resolve(texture)
      },
      undefined,
      () => resolve(null),
    )
  })
  wrapCache.set(src, pending)
  return pending
}

function planarUVs(geo, cx, cz) {
  const pos = geo.attributes.position
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i += 1) {
    uv[i * 2] = (pos.getX(i) + cx + CASE_W / 2) / CASE_W
    uv[i * 2 + 1] = 1 - (pos.getZ(i) + cz + CASE_D / 2) / CASE_D
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
}

function legendTexture(label, color, wide) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = wide ? size * 2 : size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const px = label.length > 1 ? 44 : 62
  ctx.font = `600 ${px}px Manrope, system-ui, -apple-system, sans-serif`
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

class KeyboardScene {
  constructor(container, cfg, onStrike) {
    this.container = container
    this.cfg = cfg
    this.onStrike = onStrike

    this.scene = new THREE.Scene()
    this.board = new THREE.Group()
    this.keys = []
    this.byCode = new Map()
    this.caseMesh = null
    this.metalMaterials = []
    this.wrapMaterials = []
    this.wrapTexture = null

    this.raycaster = new THREE.Raycaster()
    this.ndc = new THREE.Vector2()
    this.hovered = null
    this.pointerKey = null
    this.audio = null
    this.ctrlPending = 0
    this.ctrlDownAt = 0

    this.pointerX = 0
    this.pointerY = 0
    this.lean = new THREE.Vector2()
    this.grip = 0
    this.gripTarget = 0

    this.width = 0
    this.height = 0
    this.frameId = 0
    this.lastT = 0
    this.disposed = false

    this.geometries = []
    this.textures = []

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.shadowMap.enabled = !!cfg.shadows && cfg.finish !== 'metal'
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    const el = this.renderer.domElement
    el.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;touch-action:manipulation;display:block;'
    container.appendChild(el)

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200)
    this.scene.add(this.board)
    this.buildLights()
    this.buildBoard()

    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerLeave = this.onPointerLeave.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onBlur = this.onBlur.bind(this)

    container.addEventListener('pointermove', this.onPointerMove)
    container.addEventListener('pointerdown', this.onPointerDown)
    container.addEventListener('pointerleave', this.onPointerLeave)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.onBlur)
  }

  makeMaterial(color, rough, metal) {
    if (this.cfg.finish === 'metal') {
      const mat = new THREE.MeshMatcapMaterial({
        color: new THREE.Color(color),
        matcap: matcapTexture || null,
      })
      this.metalMaterials.push(mat)
      return mat
    }
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: rough,
      metalness: metal,
    })
  }

  ensureMatcap() {
    if (this.cfg.finish !== 'metal' || matcapTexture) return
    loadMatcap().then((t) => {
      if (this.disposed || !t) return
      this.metalMaterials.forEach((m) => {
        m.matcap = t
        m.needsUpdate = true
      })
    })
  }

  buildLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.1))
    this.scene.add(new THREE.HemisphereLight(0xbcd0ff, 0x1a1a24, 0.6))

    const key = new THREE.DirectionalLight(0xffffff, 2.1)
    key.position.set(-6, 12, 7)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    const cam = key.shadow.camera
    cam.left = -12
    cam.right = 12
    cam.top = 12
    cam.bottom = -12
    cam.near = 1
    cam.far = 40
    this.scene.add(key)

    const rim = new THREE.DirectionalLight(0x8fb0ff, 0.7)
    rim.position.set(6, 5, -8)
    this.scene.add(rim)
  }

  buildBoard() {
    const cfg = this.cfg
    const S = settingsFor(cfg)
    const wrapped = cfg.finish === 'wrap' && !!srcOf(cfg.image)

    const caseGeo = boxGeometry(CASE_W, CASE_D, 0.85, 0.35, 0.06)
    if (wrapped) planarUVs(caseGeo, 0, 0)
    this.geometries.push(caseGeo)
    const caseMat = this.makeMaterial(
      wrapped ? '#FFFFFF' : cfg.caseColor || DEFAULTS.caseColor,
      0.55,
      0.12,
    )
    if (wrapped) this.wrapMaterials.push(caseMat)
    const shell = new THREE.Mesh(caseGeo, caseMat)
    shell.position.y = -0.85
    shell.receiveShadow = true
    shell.castShadow = false
    this.caseMesh = shell
    this.board.add(shell)

    const capGeos = new Map()
    const legendTex = new Map()
    const legendGeo = new THREE.PlaneGeometry(1, 1)
    this.geometries.push(legendGeo)

    for (let r = 0; r < ROWS.length; r += 1) {
      let x = -UNITS_WIDE / 2
      for (const [label, code, width] of ROWS[r]) {
        const capW = width - S.gap * 2
        const capD = 1 - S.gap * 2
        const cx = x + width / 2
        const cz = r - (ROW_COUNT - 1) / 2

        let geo = capGeos.get(width)
        if (!geo) {
          geo = boxGeometry(capW, capD, CAP_HEIGHT, 0.13, 0.05)
          capGeos.set(width, geo)
          this.geometries.push(geo)
        }
        if (wrapped) {
          geo = geo.clone()
          planarUVs(geo, cx, cz)
          this.geometries.push(geo)
        }

        const isMod = width > 1
        const capColor = wrapped
          ? '#FFFFFF'
          : isMod
            ? cfg.modColor || DEFAULTS.modColor
            : cfg.keyColor || DEFAULTS.keyColor
        const mat = this.makeMaterial(capColor, 0.72, 0.05)
        if (wrapped) this.wrapMaterials.push(mat)

        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(cx, 0, cz)
        mesh.castShadow = true
        mesh.receiveShadow = true
        this.board.add(mesh)

        let legend = null
        if (label) {
          const color = isMod
            ? cfg.modLegendColor || DEFAULTS.modLegendColor
            : cfg.legendColor || DEFAULTS.legendColor
          const cacheKey = `${label}|${color}`
          if (!legendTex.has(cacheKey)) {
            const tex = legendTexture(label, color, label.length > 1)
            if (tex) this.textures.push(tex)
            legendTex.set(cacheKey, tex)
          }
          const tex = legendTex.get(cacheKey)
          if (tex) {
            const lm = new THREE.MeshBasicMaterial({
              map: tex,
              transparent: true,
              depthWrite: false,
              toneMapped: false,
            })
            legend = new THREE.Mesh(legendGeo, lm)
            legend.rotation.x = -Math.PI / 2
            const ls = label.length > 1 ? 0.62 : 0.44
            legend.scale.set(ls * (label.length > 1 ? 2 : 1), ls, 1)
            legend.position.set(0, CAP_HEIGHT + 0.006, 0)
            mesh.add(legend)
          }
        }

        const key = {
          mesh,
          legend,
          material: mat,
          baseColor: capColor,
          baseY: 0,
          press: 0,
          velocity: 0,
          pointerHeld: false,
          keyHeld: false,
          isMod,
          width,
          label,
          code,
        }
        mesh.userData.key = key
        this.keys.push(key)
        this.byCode.set(code, key)
        x += width
      }
    }

    this.ensureMatcap()
    this.applyWrap()
  }

  applyWrap() {
    const src = this.cfg.finish === 'wrap' ? srcOf(this.cfg.image) : ''
    if (!src || this.wrapMaterials.length === 0) return
    loadWrap(src).then((tex) => {
      if (this.disposed || !tex) return
      this.wrapTexture = tex
      this.wrapMaterials.forEach((m) => {
        m.map = tex
        m.needsUpdate = true
      })
    })
  }

  onPointerMove(e) {
    const rect = this.container.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    this.pointerX = (e.clientX - rect.left) / rect.width
    this.pointerY = (e.clientY - rect.top) / rect.height
    this.ndc.x = this.pointerX * 2 - 1
    this.ndc.y = -(this.pointerY * 2 - 1)
    this.gripTarget = 1
  }

  pick() {
    this.raycaster.setFromCamera(this.ndc, this.camera)
    const hits = this.raycaster.intersectObjects(
      this.keys.map((k) => k.mesh),
      false,
    )
    return hits.length ? hits[0].object.userData.key : null
  }

  onPointerDown(e) {
    this.onPointerMove(e)
    const key = this.pick()
    if (!key) return
    this.pointerKey = key
    key.pointerHeld = true
    this.strike(key, true)
  }

  onPointerUp() {
    if (this.pointerKey) {
      this.pointerKey.pointerHeld = false
      this.pointerKey = null
    }
  }

  onPointerLeave() {
    this.gripTarget = 0
    this.onPointerUp()
    this.hovered = null
  }

  onKeyDown(e) {
    if (e.repeat) return
    const key = this.byCode.get(e.code)
    if (!key || key.keyHeld) return

    if (e.code === 'ControlLeft') {
      this.ctrlDownAt = performance.now()
      cancelAnimationFrame(this.ctrlPending)
      this.ctrlPending = requestAnimationFrame(() => {
        this.ctrlPending = 0
        if (this.disposed || key.keyHeld) return
        key.keyHeld = true
        this.strike(key, false)
      })
      return
    }

    if (e.code === 'AltRight') {
      if (this.ctrlPending) {
        cancelAnimationFrame(this.ctrlPending)
        this.ctrlPending = 0
      } else if (performance.now() - this.ctrlDownAt < 90) {
        const ctrl = this.byCode.get('ControlLeft')
        if (ctrl && ctrl.keyHeld) {
          ctrl.keyHeld = false
          ctrl.press = 0
          ctrl.velocity = 0
        }
      }
    }

    key.keyHeld = true
    this.strike(key, false)
  }

  onKeyUp(e) {
    if (e.code === 'ControlLeft' && this.ctrlPending) {
      cancelAnimationFrame(this.ctrlPending)
      this.ctrlPending = 0
      const ctrl = this.byCode.get('ControlLeft')
      if (ctrl && !ctrl.keyHeld) this.strike(ctrl, false)
    }
    const key = this.byCode.get(e.code)
    if (key) key.keyHeld = false
  }

  onBlur() {
    cancelAnimationFrame(this.ctrlPending)
    this.ctrlPending = 0
    this.keys.forEach((k) => {
      k.keyHeld = false
      k.pointerHeld = false
    })
    this.pointerKey = null
  }

  strike(key, fromPointer) {
    key.velocity = -14
    if (typeof this.onStrike === 'function') {
      this.onStrike({ code: key.code, label: key.label, fromPointer: !!fromPointer })
    }
    if (!this.cfg.sound) return
    const S = settingsFor(this.cfg)
    if (S.volume <= 0.001) return
    try {
      if (!this.audio) {
        const Ctx = window.AudioContext || window.webkitAudioContext
        if (!Ctx) return
        this.audio = new Ctx()
      }
      const ac = this.audio
      if (!ac) return
      if (ac.state === 'suspended') ac.resume()

      const now = ac.currentTime
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'square'
      const base = S.pitch * (key.width > 2 ? 0.55 : 1)
      osc.frequency.setValueAtTime(base * (0.92 + Math.random() * 0.16), now)
      osc.frequency.exponentialRampToValueAtTime(base * 0.55, now + 0.05)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(S.volume, now + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
      osc.connect(gain)
      gain.connect(ac.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } catch {
      // ignore audio failures
    }
  }

  start() {
    this.lastT = performance.now()
    const loop = () => {
      if (this.disposed) return
      this.frameId = requestAnimationFrame(loop)
      this.step()
    }
    this.frameId = requestAnimationFrame(loop)
  }

  setSize(width, height) {
    if (this.disposed || width <= 0 || height <= 0) return
    this.width = width
    this.height = height
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.placeCamera()
  }

  placeCamera() {
    const S = settingsFor(this.cfg)
    const elev = S.tilt
    const projected = CASE_D * Math.sin(elev) + 1.6 * Math.cos(elev)
    const vFov = (this.camera.fov * Math.PI) / 180
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect)
    const distV = projected / 2 / Math.tan(vFov / 2)
    const distH = CASE_W / 2 / Math.tan(hFov / 2)
    const dist = Math.max(distV, distH) * 1.12 * S.zoom

    this.camera.position.set(0, Math.sin(elev) * dist, Math.cos(elev) * dist)
    this.camera.lookAt(0, 0, 0)
    this.camera.updateProjectionMatrix()
  }

  updateConfig(cfg) {
    if (this.disposed) return
    const prev = this.cfg
    this.cfg = cfg
    this.renderer.shadowMap.enabled = !!cfg.shadows && cfg.finish !== 'metal'

    const wrapped = cfg.finish === 'wrap' && !!srcOf(cfg.image)
    if (this.caseMesh) {
      const m = this.caseMesh.material
      m.color.set(wrapped ? '#FFFFFF' : cfg.caseColor || DEFAULTS.caseColor)
    }
    if (!wrapped) {
      this.keys.forEach((k) => {
        k.baseColor = k.isMod
          ? cfg.modColor || DEFAULTS.modColor
          : cfg.keyColor || DEFAULTS.keyColor
        k.material.color.set(k.baseColor)
      })
    }

    if (
      prev.gap !== cfg.gap ||
      prev.finish !== cfg.finish ||
      srcOf(prev.image) !== srcOf(cfg.image) ||
      prev.legendColor !== cfg.legendColor ||
      prev.modLegendColor !== cfg.modLegendColor
    ) {
      this.rebuild()
    } else {
      this.placeCamera()
    }
  }

  rebuild() {
    this.board.clear()
    this.keys = []
    this.byCode.clear()
    this.metalMaterials = []
    this.wrapMaterials = []
    this.disposeAssets()
    this.buildBoard()
    this.placeCamera()
  }

  step() {
    if (this.disposed || this.width <= 0) return
    const now = performance.now()
    let dt = (now - this.lastT) / 1000
    this.lastT = now
    if (!Number.isFinite(dt) || dt < 0) dt = 0
    if (dt > 0.05) dt = 0.05

    const S = settingsFor(this.cfg)

    this.grip += (this.gripTarget - this.grip) * (1 - Math.exp(-dt * 4))
    if (this.cfg.followPointer) {
      const wantX = (this.pointerY - 0.5) * S.lean * this.grip
      const wantY = (this.pointerX - 0.5) * S.lean * this.grip * 2.2
      const k = 1 - Math.exp(-dt * 5)
      this.lean.x += (wantX - this.lean.x) * k
      this.lean.y += (wantY - this.lean.y) * k
    } else {
      this.lean.multiplyScalar(1 - Math.min(1, dt * 5))
    }
    this.board.rotation.x = this.lean.x
    this.board.rotation.y = this.lean.y

    const hover = this.grip > 0.01 ? this.pick() : null
    this.hovered = hover

    const damping = 2 * Math.sqrt(S.stiffness) * 0.6
    for (let i = 0; i < this.keys.length; i += 1) {
      const k = this.keys[i]
      const target = k.pointerHeld || k.keyHeld ? 1 : 0
      const accel = (target - k.press) * S.stiffness - k.velocity * damping
      k.velocity += accel * dt
      k.press += k.velocity * dt
      if (k.press < -0.05) {
        k.press = -0.05
        k.velocity = 0
      }

      const lift = k === hover && target === 0 ? 0.012 : 0
      k.mesh.position.y = k.baseY - k.press * TRAVEL + lift

      const heat = Math.max(0, Math.min(1, k.press))
      const base = k.baseColor
      if (heat > 0.002) {
        k.material.color
          .set(base)
          .lerp(new THREE.Color(this.cfg.pressColor || DEFAULTS.pressColor), heat)
      } else if (k === hover) {
        k.material.color.set(base).lerp(new THREE.Color(0xffffff), 0.12)
      } else {
        k.material.color.set(base)
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  disposeAssets() {
    this.wrapTexture = null
    this.geometries.forEach((g) => g.dispose())
    this.textures.forEach((t) => t.dispose())
    this.geometries = []
    this.textures = []
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frameId)
    cancelAnimationFrame(this.ctrlPending)
    this.container.removeEventListener('pointermove', this.onPointerMove)
    this.container.removeEventListener('pointerdown', this.onPointerDown)
    this.container.removeEventListener('pointerleave', this.onPointerLeave)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.onBlur)
    this.disposeAssets()
    this.keys.forEach((k) => k.material.dispose())
    if (this.caseMesh) this.caseMesh.material.dispose()
    this.renderer.dispose()
    if (this.audio) this.audio.close().catch(() => {})
    const el = this.renderer.domElement
    if (el.parentNode === this.container) this.container.removeChild(el)
  }
}

const CODE_TO_CHAR = {
  KeyA: 'A',
  KeyB: 'B',
  KeyC: 'C',
  KeyD: 'D',
  KeyE: 'E',
  KeyF: 'F',
  KeyG: 'G',
  KeyH: 'H',
  KeyI: 'I',
  KeyJ: 'J',
  KeyK: 'K',
  KeyL: 'L',
  KeyM: 'M',
  KeyN: 'N',
  KeyO: 'O',
  KeyP: 'P',
  KeyQ: 'Q',
  KeyR: 'R',
  KeyS: 'S',
  KeyT: 'T',
  KeyU: 'U',
  KeyV: 'V',
  KeyW: 'W',
  KeyX: 'X',
  KeyY: 'Y',
  KeyZ: 'Z',
  Digit0: '0',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',
  Space: ' ',
  Backspace: 'Backspace',
  Enter: 'Enter',
}

export function codeToInput(code) {
  return CODE_TO_CHAR[code] || null
}

export default function MechKeyboard({
  finish = DEFAULTS.finish,
  caseColor = DEFAULTS.caseColor,
  keyColor = DEFAULTS.keyColor,
  modColor = DEFAULTS.modColor,
  pressColor = DEFAULTS.pressColor,
  legendColor = DEFAULTS.legendColor,
  modLegendColor = DEFAULTS.modLegendColor,
  image,
  tilt = DEFAULTS.tilt,
  size = DEFAULTS.size,
  stiffness = DEFAULTS.stiffness,
  gap = DEFAULTS.gap,
  shadows = DEFAULTS.shadows,
  sound = DEFAULTS.sound,
  soundOptions = DEFAULTS.soundOptions,
  followPointer = DEFAULTS.followPointer,
  strength = DEFAULTS.strength,
  onStrike,
  style,
  className = '',
}) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const onStrikeRef = useRef(onStrike)
  onStrikeRef.current = onStrike

  const cfgRef = useRef(null)
  cfgRef.current = {
    finish,
    caseColor,
    keyColor,
    modColor,
    pressColor,
    legendColor,
    modLegendColor,
    image,
    tilt,
    size,
    stiffness,
    gap,
    shadows,
    sound,
    soundOptions,
    followPointer,
    strength,
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    let scene
    try {
      scene = new KeyboardScene(container, cfgRef.current, (payload) => {
        onStrikeRef.current?.(payload)
      })
    } catch {
      return undefined
    }
    sceneRef.current = scene
    scene.setSize(container.clientWidth, container.clientHeight)
    scene.start()

    const ro = new ResizeObserver(() => {
      scene.setSize(container.clientWidth, container.clientHeight)
    })
    ro.observe(container)
    return () => {
      ro.disconnect()
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.updateConfig(cfgRef.current)
  }, [
    finish,
    caseColor,
    keyColor,
    modColor,
    pressColor,
    legendColor,
    modLegendColor,
    image,
    tilt,
    size,
    stiffness,
    gap,
    shadows,
    sound,
    soundOptions,
    followPointer,
    strength,
  ])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Mechanical keyboard — type ENTER to continue"
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minWidth: 200,
        minHeight: 140,
        overflow: 'hidden',
        ...style,
      }}
    />
  )
}
