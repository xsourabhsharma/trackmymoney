'use client'

import * as THREE from 'three'
import { DecorativeThreeSceneCanvas } from './DecorativeThreeSceneCanvas'
import type { DecorativeSceneCanvasProps } from './types'

const coinAngles = [0, 1.2, 2.35, 3.55, 4.68, 5.65]
const barHeights = [0.48, 0.92, 0.68, 1.18, 0.82]
const heroCamera = { fov: 38, position: [0, 0.1, 5.4] as [number, number, number] }

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

function createPublicHeroScene(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.64))

  const directionalLight = new THREE.DirectionalLight('#fff0d8', 2.4)
  directionalLight.position.set(3.8, 4.2, 4.6)
  scene.add(directionalLight)

  const orangeLight = new THREE.PointLight('#ff5a1f', 1.5)
  orangeLight.position.set(-2.4, -1.8, 2.8)
  scene.add(orangeLight)

  const limeLight = new THREE.PointLight('#d9ff74', 0.82)
  limeLight.position.set(2.8, 1.8, 2.4)
  scene.add(limeLight)

  const root = new THREE.Group()
  root.position.set(0, 0.08, 0)

  const wallet = new THREE.Group()
  const orbit = new THREE.Group()
  const bars = new THREE.Group()

  wallet.rotation.set(-0.13, -0.36, 0.04)
  wallet.position.set(-0.28, 0.08, 0)
  orbit.position.set(-0.1, 0.1, 0.3)
  orbit.rotation.set(0.84, 0, 0)
  bars.position.set(2.08, -1.05, -0.22)
  bars.rotation.set(0.08, -0.22, 0.03)

  const geometries = {
    bar: new THREE.BoxGeometry(0.18, 1, 0.2),
    card: new THREE.BoxGeometry(2.42, 1.42, 0.12),
    chip: new THREE.BoxGeometry(0.34, 0.24, 0.035),
    coin: new THREE.CylinderGeometry(0.24, 0.24, 0.065, 32),
    coinInset: new THREE.CylinderGeometry(0.17, 0.17, 0.069, 32),
    rail: new THREE.BoxGeometry(0.7, 0.06, 0.05),
    wallet: new THREE.BoxGeometry(2.9, 1.72, 0.22),
  }

  const materials = {
    bar: new THREE.MeshStandardMaterial({ color: '#d9ff74', emissive: '#537000', emissiveIntensity: 0.12, roughness: 0.42 }),
    card: new THREE.MeshStandardMaterial({ color: '#f7f2e8', metalness: 0.1, roughness: 0.34 }),
    chip: new THREE.MeshStandardMaterial({ color: '#ffb26d', metalness: 0.55, roughness: 0.22 }),
    coin: new THREE.MeshStandardMaterial({ color: '#ff8a3d', emissive: '#5a1800', emissiveIntensity: 0.16, metalness: 0.62, roughness: 0.26 }),
    coinFace: new THREE.MeshStandardMaterial({ color: '#ffd28a', metalness: 0.54, roughness: 0.25 }),
    dark: new THREE.MeshStandardMaterial({ color: '#11100e', metalness: 0.22, roughness: 0.5 }),
    green: new THREE.MeshStandardMaterial({ color: '#d9ff74', emissive: '#4c6400', emissiveIntensity: 0.14, roughness: 0.38 }),
    line: new THREE.MeshStandardMaterial({ color: '#f7f2e8', transparent: true, opacity: 0.42, roughness: 0.52 }),
    orange: new THREE.MeshStandardMaterial({ color: '#ff5a1f', emissive: '#6b1700', emissiveIntensity: 0.18, roughness: 0.34 }),
  }

  wallet.add(createMesh(geometries.wallet, materials.dark, [0, -0.08, 0]))
  wallet.add(createMesh(geometries.card, materials.card, [-0.12, 0.2, 0.2], [0, 0, 0.06]))
  wallet.add(createMesh(geometries.card, materials.green, [0.26, 0.05, 0.1], [0, 0, -0.08], [0.92, 0.82, 0.7]))
  wallet.add(createMesh(geometries.chip, materials.chip, [-0.9, 0.28, 0.285]))
  wallet.add(createMesh(geometries.rail, materials.line, [0.42, 0.42, 0.285], undefined, [0.82, 1, 1]))
  wallet.add(createMesh(geometries.rail, materials.line, [0.54, 0.18, 0.285], undefined, [1.08, 1, 1]))
  wallet.add(createMesh(geometries.rail, materials.orange, [-0.76, -0.42, 0.205], undefined, [0.65, 1, 1]))

  coinAngles.forEach((angle, index) => {
    const coin = new THREE.Group()
    coin.position.set(Math.cos(angle) * 2.12, Math.sin(angle) * 1.02, Math.sin(angle * 1.7) * 0.18)
    coin.scale.setScalar(index % 2 === 0 ? 1 : 0.82)
    coin.add(createMesh(geometries.coin, materials.coin, undefined, [Math.PI / 2, 0, angle]))
    coin.add(createMesh(geometries.coinInset, materials.coinFace, [0, 0, 0.004], [Math.PI / 2, 0, angle]))
    orbit.add(coin)
  })

  barHeights.forEach((height, index) => {
    bars.add(
      createMesh(
        geometries.bar,
        index === 1 || index === 3 ? materials.orange : materials.bar,
        [index * 0.32, height / 2, 0],
        undefined,
        [1, height, 1]
      )
    )
  })

  root.add(wallet)
  root.add(orbit)
  root.add(bars)
  root.add(createMesh(geometries.coin, materials.coinFace, [-2.35, -0.92, -0.24], [Math.PI / 2, 0, -0.28], 0.72))
  root.add(createMesh(geometries.coin, materials.coin, [2.28, 1.15, -0.4], [Math.PI / 2, 0, 0.34], 0.62))
  scene.add(root)

  return {
    update(time: number) {
      wallet.rotation.y = -0.36 + Math.sin(time * 0.35) * 0.08
      wallet.position.y = Math.sin(time * 0.62) * 0.06
      orbit.rotation.z = time * 0.24
      orbit.rotation.x = 0.84 + Math.sin(time * 0.25) * 0.04
      bars.children.forEach((child, index) => {
        child.scale.y = 0.9 + Math.sin(time * 1.1 + index * 0.8) * 0.08
      })
    },
  }
}

export default function PublicHeroSceneCanvas({ className }: DecorativeSceneCanvasProps) {
  return (
    <DecorativeThreeSceneCanvas
      camera={heroCamera}
      className={className}
      createScene={createPublicHeroScene}
      minHeightClass="min-h-[260px]"
    />
  )
}
