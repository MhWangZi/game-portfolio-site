import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { VisualTheme } from '../types'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type PortfolioSceneProps = {
  theme: VisualTheme
}

function createMotif(theme: VisualTheme) {
  const group = new THREE.Group()
  const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xd7ff45,
    wireframe: true,
    transparent: true,
    opacity: 0.72,
  })
  const glassMaterial = new THREE.MeshBasicMaterial({
    color: 0x7fdbe7,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
  })

  if (theme === 'voxel') {
    const box = new THREE.BoxGeometry(0.42, 0.42, 0.42)
    for (let x = -2; x <= 2; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        if ((x + y) % 2 === 0) {
          const mesh = new THREE.Mesh(box, lineMaterial)
          mesh.position.set(x * 0.55, y * 0.55, Math.sin(x + y) * 0.38)
          group.add(mesh)
        }
      }
    }
  } else if (theme === 'terrain') {
    const terrain = new THREE.PlaneGeometry(4.8, 2.6, 22, 12)
    const positions = terrain.attributes.position
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      positions.setZ(i, Math.sin(x * 2.2) * 0.18 + Math.cos(y * 3.5) * 0.12)
    }
    positions.needsUpdate = true
    terrain.computeVertexNormals()
    const mesh = new THREE.Mesh(terrain, lineMaterial)
    mesh.rotation.x = -0.72
    group.add(mesh)
  } else if (theme === 'ui-panels') {
    const panel = new THREE.PlaneGeometry(1.65, 0.92)
    for (let i = 0; i < 5; i += 1) {
      const mesh = new THREE.Mesh(panel, i % 2 === 0 ? glassMaterial : lineMaterial)
      mesh.position.set((i - 2) * 0.74, Math.sin(i) * 0.34, -i * 0.18)
      mesh.rotation.y = (i - 2) * 0.18
      group.add(mesh)
    }
  } else if (theme === 'artifact') {
    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(0.78, 0.13, 96, 10), lineMaterial)
    group.add(torus)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.01, 8, 90), glassMaterial)
    ring.rotation.x = Math.PI / 2
    group.add(ring)
  } else {
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), lineMaterial)
    group.add(core)
  }

  group.position.set(1.6, -0.2, -1.5)
  return group
}

function createParticleField(count: number) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const colorA = new THREE.Color(0xd7ff45)
  const colorB = new THREE.Color(0x7fdbe7)

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 8
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4.8
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5
    const color = i % 3 === 0 ? colorB : colorA
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
  })

  return new THREE.Points(geometry, material)
}

export function PortfolioScene({ theme }: PortfolioSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const compact = window.innerWidth < 760
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.15 : 1.6))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    const particles = createParticleField(compact ? 48 : 120)
    scene.add(particles)

    const shards = new THREE.Group()
    const shardMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8efe0,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
    const shardGeometry = new THREE.TetrahedronGeometry(0.22, 0)
    const shardCount = compact ? 8 : 18
    for (let i = 0; i < shardCount; i += 1) {
      const shard = new THREE.Mesh(shardGeometry, shardMaterial)
      shard.position.set((Math.random() - 0.5) * 5.8, (Math.random() - 0.5) * 3.2, -Math.random() * 4)
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      shards.add(shard)
    }
    scene.add(shards)

    const motif = createMotif(theme)
    scene.add(motif)

    const pointer = new THREE.Vector2()
    const target = new THREE.Vector2()
    let frame = 0
    let animationId = 0

    const resize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * -2
    }

    const render = () => {
      frame += 1
      pointer.lerp(target, reducedMotion ? 0.04 : 0.08)
      particles.rotation.y += reducedMotion ? 0 : 0.0009
      particles.rotation.x = pointer.y * 0.05
      shards.rotation.y += reducedMotion ? 0 : 0.002
      shards.rotation.x = pointer.y * 0.08
      motif.rotation.y = pointer.x * 0.22 + frame * (reducedMotion ? 0 : 0.003)
      motif.rotation.x = pointer.y * 0.16
      camera.position.x = pointer.x * 0.18
      camera.position.y = pointer.y * 0.12
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
      if (!reducedMotion) animationId = window.requestAnimationFrame(render)
    }

    canvas.dataset.sceneMode = compact ? 'compact' : 'full'
    canvas.dataset.motion = reducedMotion ? 'reduced' : 'normal'
    canvas.dataset.theme = theme
    window.__portfolioSceneState = {
      mode: compact ? 'compact' : 'full',
      motion: reducedMotion ? 'reduced' : 'normal',
      theme,
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('pointermove', handlePointerMove)
    resize()
    render()

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('pointermove', handlePointerMove)
      resizeObserver.disconnect()
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        mesh.geometry?.dispose()
        const material = mesh.material
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose())
        } else {
          material?.dispose()
        }
      })
      renderer.dispose()
    }
  }, [reducedMotion, theme])

  return <canvas ref={canvasRef} className="scene-canvas" data-testid="portfolio-three-canvas" aria-hidden="true" />
}
