'use client'

import * as THREE from 'three'
import { DecorativeThreeSceneCanvas } from './DecorativeThreeSceneCanvas'
import type { DecorativeSceneCanvasProps } from './types'

const authCamera = { fov: 38, position: [0, 0.05, 5.35] as [number, number, number] }
const coinPositions: Array<[number, number, number, number]> = [
  [-1.86, 0.86, -0.22, -0.24],
  [1.72, 0.72, -0.32, 0.18],
  [-1.5, -1.08, -0.2, 0.38],
  [1.96, -0.86, -0.38, -0.12],
]
const nodePositions: Array<[number, number, number]> = [
  [-2.3, 0.18, -0.42],
  [2.24, 0.08, -0.44],
  [-0.72, 1.68, -0.48],
  [0.74, -1.72, -0.48],
]

function createShieldShape() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 1.38)
  shape.bezierCurveTo(0.78, 1.12, 1.18, 0.95, 1.18, 0.95)
  shape.bezierCurveTo(1.12, 0.0, 0.82, -0.82, 0, -1.38)
  shape.bezierCurveTo(-0.82, -0.82, -1.12, 0.0, -1.18, 0.95)
  shape.bezierCurveTo(-1.18, 0.95, -0.78, 1.12, 0, 1.38)
  return shape
}

function createMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position?: [number, number, number],
  rotation?: [number, number, number],
  scale?: [number, number, number] | number
) {
  const mesh = new THREE.Mesh(geometry, material)

  if (position) {
    mesh.position.set(...position)
  }

  if (rotation) {
    mesh.rotation.set(...rotation)
  }

  if (typeof scale === 'number') {
    mesh.scale.setScalar(scale)
  } else if (scale) {
    mesh.scale.set(...scale)
  }

  return mesh
}

function createAuthTrustScene(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.66))

  const directionalLight = new THREE.DirectionalLight('#fff1d9', 2.35)
  directionalLight.position.set(2.8, 3.6, 4.4)
  scene.add(directionalLight)

  const orangeLight = new THREE.PointLight('#ff5a1f', 1.4)
  orangeLight.position.set(-2.4, 1.6, 2.4)
  scene.add(orangeLight)

  const limeLight = new THREE.PointLight('#d9ff74', 0.72)
  limeLight.position.set(2.2, -1.8, 2.5)
  scene.add(limeLight)

  const shieldShape = createShieldShape()
  const lock = new THREE.Group()
  const ring = new THREE.Group()
  const nodes = new THREE.Group()

  lock.rotation.set(-0.05, 0, 0)
  ring.position.set(0, 0, -0.58)

  const geometries = {
    checkStem: new THREE.BoxGeometry(0.08, 0.42, 0.06),
    checkSweep: new THREE.BoxGeometry(0.08, 0.72, 0.06),
    coin: new THREE.CylinderGeometry(0.2, 0.2, 0.055, 32),
    coinFace: new THREE.CylinderGeometry(0.145, 0.145, 0.058, 32),
    lockBody: new THREE.BoxGeometry(0.9, 0.68, 0.24),
    lockSlot: new THREE.CylinderGeometry(0.055, 0.055, 0.04, 18),
    node: new THREE.SphereGeometry(0.06, 16, 16),
    rail: new THREE.BoxGeometry(1, 0.025, 0.025),
    shackle: new THREE.TorusGeometry(0.37, 0.055, 12, 34, Math.PI),
    shield: new THREE.ShapeGeometry(shieldShape),
  }

  const materials = {
    check: new THREE.MeshStandardMaterial({ color: '#d9ff74', emissive: '#536c00', emissiveIntensity: 0.18, roughness: 0.32 }),
    coin: new THREE.MeshStandardMaterial({ color: '#ff7734', emissive: '#631900', emissiveIntensity: 0.14, metalness: 0.58, roughness: 0.25 }),
    coinFace: new THREE.MeshStandardMaterial({ color: '#ffc477', metalness: 0.45, roughness: 0.28 }),
    lock: new THREE.MeshStandardMaterial({ color: '#11100e', metalness: 0.34, roughness: 0.38 }),
    lockAccent: new THREE.MeshStandardMaterial({ color: '#ff5a1f', emissive: '#5d1800', emissiveIntensity: 0.2, metalness: 0.28, roughness: 0.28 }),
    node: new THREE.MeshStandardMaterial({ color: '#f7f2e8', emissive: '#ff5a1f', emissiveIntensity: 0.12, roughness: 0.5 }),
    rail: new THREE.MeshStandardMaterial({ color: '#f7f2e8', transparent: true, opacity: 0.28 }),
    shield: new THREE.MeshStandardMaterial({ color: '#d9ff74', emissive: '#1f2b00', emissiveIntensity: 0.08, metalness: 0.12, opacity: 0.22, roughness: 0.36, side: THREE.DoubleSide, transparent: true }),
    shieldEdge: new THREE.MeshStandardMaterial({ color: '#ff6f2f', emissive: '#421000', emissiveIntensity: 0.22, metalness: 0.2, roughness: 0.28, side: THREE.DoubleSide }),
  }

  ring.add(createMesh(geometries.rail, materials.rail, undefined, [0, 0, 0.35], [4.55, 1, 1]))
  ring.add(createMesh(geometries.rail, materials.rail, undefined, [0, 0, -0.35], [4.55, 1, 1]))
  ring.add(createMesh(geometries.rail, materials.rail, undefined, [0, 0, 1.2], [3.72, 1, 1]))

  nodePositions.forEach(([x, y, z]) => {
    nodes.add(createMesh(geometries.node, materials.node, [x, y, z]))
  })

  lock.add(createMesh(geometries.shield, materials.shield, [0, 0, -0.08], undefined, [1.38, 1.38, 1]))
  lock.add(createMesh(geometries.shield, materials.shieldEdge, [0, 0, -0.075], undefined, [1.05, 1.05, 1]))
  lock.add(createMesh(geometries.shackle, materials.lockAccent, [0, 0.26, 0.1], [0, 0, Math.PI]))
  lock.add(createMesh(geometries.lockBody, materials.lock, [0, -0.28, 0.1]))
  lock.add(createMesh(geometries.lockSlot, materials.lockAccent, [0, -0.28, 0.24], [Math.PI / 2, 0, 0]))
  lock.add(createMesh(geometries.checkStem, materials.check, [-0.1, -0.18, 0.265], [0, 0, -0.62]))
  lock.add(createMesh(geometries.checkSweep, materials.check, [0.14, -0.08, 0.265], [0, 0, 0.75]))

  scene.add(ring)
  scene.add(nodes)
  scene.add(lock)

  coinPositions.forEach(([x, y, z, rotation], index) => {
    const coin = new THREE.Group()
    coin.position.set(x, y, z)
    coin.scale.setScalar(index % 2 === 0 ? 0.9 : 0.74)
    coin.add(createMesh(geometries.coin, materials.coin, undefined, [Math.PI / 2, 0, rotation]))
    coin.add(createMesh(geometries.coinFace, materials.coinFace, [0, 0, 0.004], [Math.PI / 2, 0, rotation]))
    scene.add(coin)
  })

  return {
    update(time: number) {
      lock.rotation.y = Math.sin(time * 0.34) * 0.11
      lock.position.y = Math.sin(time * 0.56) * 0.05
      ring.rotation.z = time * 0.18
      nodes.children.forEach((child, index) => {
        child.scale.setScalar(0.9 + Math.sin(time * 1.1 + index) * 0.12)
      })
    },
  }
}

export default function AuthTrustSceneCanvas({ className }: DecorativeSceneCanvasProps) {
  return (
    <DecorativeThreeSceneCanvas
      camera={authCamera}
      className={className}
      createScene={createAuthTrustScene}
      minHeightClass="min-h-[260px]"
    />
  )
}
