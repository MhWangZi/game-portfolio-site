import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import type { ChapterId, ScenePreset, SceneState } from '../types'

type PortfolioSceneProps = {
  state: SceneState
}

const chapterPhase: Record<ChapterId | 'admin', number> = {
  current: 0,
  radar: 1,
  cases: 2,
  projects: 3,
  notes: 4,
  contact: 5,
  admin: 6,
}

const presetPhase: Record<ScenePreset, number> = {
  'tool-grid': 0,
  'timing-gate': 1,
  'anchor-field': 2,
  'signal-branch': 3,
  'terrain-map': 4,
  'economy-orbit': 5,
  'value-lattice': 6,
  'artifact-rings': 7,
  'combat-cross': 8,
  'run-cycle': 9,
  neutral: 10,
}

function createParticleField(count: number) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const amber = new THREE.Color(0xe7a94f)
  const silver = new THREE.Color(0xc7ced8)

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 9
    positions[index * 3 + 1] = (Math.random() - 0.5) * 5.4
    positions[index * 3 + 2] = (Math.random() - 0.5) * 5
    const color = index % 4 === 0 ? silver : amber
    colors[index * 3] = color.r
    colors[index * 3 + 1] = color.g
    colors[index * 3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 0.042, vertexColors: true, transparent: true, opacity: 0.76 }),
  )
}

function createTimingGate() {
  const group = new THREE.Group()

  for (let index = 0; index < 5; index += 1) {
    const box = new THREE.BoxGeometry(1.5, 1.06, 0.08)
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    const frame = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: index === 0 ? 0xf0b45a : 0xd2d8e1,
        transparent: true,
        opacity: Math.max(0.14, 0.64 - index * 0.09),
      }),
    )
    frame.userData.frameIndex = index
    group.add(frame)
  }

  for (let index = 0; index < 3; index += 1) {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 0.78),
      new THREE.MeshBasicMaterial({
        color: 0xe7a94f,
        transparent: true,
        opacity: 0.04 + index * 0.025,
        side: THREE.DoubleSide,
      }),
    )
    panel.userData.panelIndex = index
    group.add(panel)
  }

  return group
}

function createShards(count: number) {
  const group = new THREE.Group()
  const geometry = new THREE.TetrahedronGeometry(0.18, 0)
  for (let index = 0; index < count; index += 1) {
    const shard = new THREE.Mesh(
      geometry.clone(),
      new THREE.MeshBasicMaterial({ color: 0xcbd2dc, wireframe: true, transparent: true, opacity: 0.18 }),
    )
    shard.position.set((Math.random() - 0.5) * 6.6, (Math.random() - 0.5) * 3.8, -Math.random() * 4)
    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    group.add(shard)
  }
  geometry.dispose()
  return group
}

function setFrameTarget(frame: THREE.Object3D, frameIndex: number, preset: ScenePreset, chapter: number) {
  const mode = presetPhase[preset]
  let x = 0
  let y = 0
  let z = -frameIndex * 0.28
  let rotationX = 0
  let rotationY = 0
  let rotationZ = 0
  let scale = 1 - frameIndex * 0.1

  if (preset === 'tool-grid') {
    x = (frameIndex - 2) * 0.58
    y = (frameIndex % 2 === 0 ? -1 : 1) * 0.28
    z = -Math.abs(frameIndex - 2) * 0.18
    rotationY = (frameIndex - 2) * 0.2
    scale = 0.72
  } else if (preset === 'timing-gate') {
    z = -frameIndex * 0.34
    rotationZ = frameIndex * 0.08
    scale = 1.12 - frameIndex * 0.12
  } else if (preset === 'anchor-field') {
    x = (frameIndex - 2) * 0.22
    y = (frameIndex - 2) * 0.18
    rotationZ = (frameIndex % 2 === 0 ? -1 : 1) * 0.55
    rotationY = (frameIndex - 2) * 0.14
    scale = 0.86 - frameIndex * 0.04
  } else if (preset === 'signal-branch') {
    x = (frameIndex - 2) * 0.42
    y = Math.sin(frameIndex * 1.7) * 0.36
    rotationZ = (frameIndex - 2) * 0.22
    scale = 0.7
  } else if (preset === 'economy-orbit' || preset === 'artifact-rings' || preset === 'run-cycle') {
    const angle = frameIndex / 5 * Math.PI * 2 + mode * 0.12
    x = Math.cos(angle) * (0.45 + frameIndex * 0.12)
    y = Math.sin(angle) * (0.36 + frameIndex * 0.08)
    rotationZ = angle
    rotationY = angle * 0.35
    scale = 0.58 + frameIndex * 0.06
  } else if (preset === 'combat-cross') {
    x = frameIndex % 2 === 0 ? (frameIndex - 2) * 0.32 : 0
    y = frameIndex % 2 === 1 ? (frameIndex - 2) * 0.24 : 0
    rotationZ = frameIndex % 2 === 0 ? 0 : Math.PI / 2
    scale = 0.7
  } else {
    x = Math.sin(mode + frameIndex) * 0.42
    y = Math.cos(mode * 0.7 + frameIndex) * 0.3
    rotationX = (mode % 3) * 0.14
    rotationY = (frameIndex - 2) * 0.18
    rotationZ = mode * 0.07 + frameIndex * 0.09
    scale = 0.68 + (frameIndex % 2) * 0.12
  }

  frame.userData.target = { x, y, z: z - chapter * 0.035, rotationX, rotationY, rotationZ, scale }
}

export function PortfolioScene({ state }: PortfolioSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef(state)
  const renderOnceRef = useRef<(() => void) | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    stateRef.current = state
    const canvas = canvasRef.current
    if (canvas) {
      canvas.dataset.theme = state.preset
      canvas.dataset.sceneChapter = state.activeChapter
      canvas.dataset.project = state.activeProjectId ?? 'none'
    }
    window.__portfolioSceneState = {
      mode: window.innerWidth < 760 ? 'compact' : 'full',
      motion: reducedMotion ? 'reduced' : 'normal',
      theme: state.preset,
      chapter: state.activeChapter,
      project: state.activeProjectId,
    }
    if (reducedMotion) window.requestAnimationFrame(() => renderOnceRef.current?.())
  }, [reducedMotion, state])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const compact = window.innerWidth < 760
    let renderer: THREE.WebGLRenderer

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      })
    } catch {
      canvas.dataset.renderer = 'fallback'
      return
    }

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.1 : 1.55))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    const particles = createParticleField(compact ? 52 : 138)
    const shards = createShards(compact ? 7 : 18)
    const timingGate = createTimingGate()
    scene.add(particles, shards, timingGate)

    const pointer = new THREE.Vector2()
    const targetPointer = new THREE.Vector2()
    const gateTarget = new THREE.Vector3()
    let frameCount = 0
    let animationId = 0

    const resize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }

    const handlePointerMove = (event: PointerEvent) => {
      targetPointer.x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2
      targetPointer.y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * -2
    }

    const render = () => {
      frameCount += 1
      const currentState = stateRef.current
      const chapter = chapterPhase[currentState.activeChapter]
      const preset = currentState.preset
      const lerpAmount = reducedMotion ? 1 : 0.055

      pointer.lerp(targetPointer, reducedMotion ? 1 : 0.07)
      gateTarget.set(compact ? 0.45 : 1.55 + chapter * 0.04, -0.08 + Math.sin(chapter) * 0.08, -1.3)
      timingGate.position.lerp(gateTarget, lerpAmount)
      timingGate.rotation.x = THREE.MathUtils.lerp(timingGate.rotation.x, pointer.y * 0.08 + chapter * 0.025, lerpAmount)
      timingGate.rotation.y = THREE.MathUtils.lerp(timingGate.rotation.y, pointer.x * 0.18 + presetPhase[preset] * 0.035, lerpAmount)
      timingGate.rotation.z += reducedMotion ? 0 : 0.00045 + chapter * 0.00005

      timingGate.children.forEach((child) => {
        const frameIndex = child.userData.frameIndex as number | undefined
        const panelIndex = child.userData.panelIndex as number | undefined

        if (frameIndex !== undefined) {
          setFrameTarget(child, frameIndex, preset, chapter)
          const target = child.userData.target as {
            x: number
            y: number
            z: number
            rotationX: number
            rotationY: number
            rotationZ: number
            scale: number
          }
          child.position.x = THREE.MathUtils.lerp(child.position.x, target.x, lerpAmount)
          child.position.y = THREE.MathUtils.lerp(child.position.y, target.y, lerpAmount)
          child.position.z = THREE.MathUtils.lerp(child.position.z, target.z, lerpAmount)
          child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, target.rotationX, lerpAmount)
          child.rotation.y = THREE.MathUtils.lerp(child.rotation.y, target.rotationY, lerpAmount)
          child.rotation.z = THREE.MathUtils.lerp(child.rotation.z, target.rotationZ, lerpAmount)
          const scale = THREE.MathUtils.lerp(child.scale.x, target.scale, lerpAmount)
          child.scale.setScalar(scale)
        }

        if (panelIndex !== undefined) {
          child.position.set((panelIndex - 1) * 0.62, Math.sin(panelIndex + chapter) * 0.18, -0.7 - panelIndex * 0.18)
          child.rotation.y = (panelIndex - 1) * 0.18 + pointer.x * 0.08
        }
      })

      particles.rotation.y += reducedMotion ? 0 : 0.00065 + chapter * 0.00008
      particles.rotation.x = pointer.y * 0.035
      shards.rotation.y += reducedMotion ? 0 : 0.0014
      shards.rotation.x = pointer.y * 0.08 + frameCount * (reducedMotion ? 0 : 0.00025)
      camera.position.x = pointer.x * 0.16
      camera.position.y = pointer.y * 0.11
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)

      if (!reducedMotion) animationId = window.requestAnimationFrame(render)
    }

    renderOnceRef.current = render
    canvas.dataset.sceneMode = compact ? 'compact' : 'full'
    canvas.dataset.motion = reducedMotion ? 'reduced' : 'normal'
    canvas.dataset.renderer = 'webgl'

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('pointermove', handlePointerMove)
    resize()
    render()

    return () => {
      renderOnceRef.current = null
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('pointermove', handlePointerMove)
      resizeObserver.disconnect()
      scene.traverse((object) => {
        const renderable = object as THREE.Mesh
        renderable.geometry?.dispose()
        const material = renderable.material
        if (Array.isArray(material)) material.forEach((item) => item.dispose())
        else material?.dispose()
      })
      renderer.dispose()
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} className="scene-canvas dc-scene-canvas" data-testid="portfolio-three-canvas" aria-hidden="true" />
}
