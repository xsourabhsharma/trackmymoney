'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { cn } from '@/lib/utils'
import type { DecorativeSceneCanvasProps } from './types'

type Vector3Tuple = [number, number, number]

type DecorativeSceneController = {
  update: (time: number, delta: number) => void
}

type DecorativeThreeSceneCanvasProps = DecorativeSceneCanvasProps & {
  camera: {
    fov: number
    position: Vector3Tuple
  }
  createScene: (scene: THREE.Scene) => DecorativeSceneController
  minHeightClass: string
}

function disposeSceneResources(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()

  scene.traverse((object) => {
    const mesh = object as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>

    if (mesh.geometry instanceof THREE.BufferGeometry) {
      geometries.add(mesh.geometry)
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => materials.add(material))
    } else if (mesh.material instanceof THREE.Material) {
      materials.add(mesh.material)
    }
  })

  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
}

export function DecorativeThreeSceneCanvas({
  camera,
  className,
  createScene,
  minHeightClass,
}: DecorativeThreeSceneCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current

    if (!mount) {
      return undefined
    }

    const scene = new THREE.Scene()
    const perspectiveCamera = new THREE.PerspectiveCamera(camera.fov, 1, 0.1, 100)
    const [x, y, z] = camera.position
    perspectiveCamera.position.set(x, y, z)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    const timer = new THREE.Timer()
    const controller = createScene(scene)

    renderer.setClearAlpha(0)
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5))
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.width = '100%'
    mount.appendChild(renderer.domElement)
    timer.connect(document)

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight

      if (width === 0 || height === 0) {
        return
      }

      renderer.setSize(width, height, false)
      perspectiveCamera.aspect = width / height
      perspectiveCamera.updateProjectionMatrix()
    }

    let frameId = 0
    let resizeObserver: ResizeObserver | undefined

    const renderFrame = (timestamp: number) => {
      timer.update(timestamp)
      controller.update(timer.getElapsed(), timer.getDelta())
      renderer.render(scene, perspectiveCamera)
      frameId = window.requestAnimationFrame(renderFrame)
    }

    resize()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(mount)
    } else {
      window.addEventListener('resize', resize)
    }

    frameId = window.requestAnimationFrame(renderFrame)

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resize)
      timer.dispose()
      disposeSceneResources(scene)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [camera, createScene])

  return <div ref={mountRef} className={cn('h-full w-full', minHeightClass, className)} />
}
