'use client'

import * as THREE from 'three'
import { DecorativeThreeSceneCanvas } from './DecorativeThreeSceneCanvas'
import type { DecorativeSceneCanvasProps } from './types'

const legalCamera = { fov: 38, position: [0, 0, 5.2] as [number, number, number] }
const spokeAngles = [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3]
const ledgerBars = [0.56, 0.86, 0.44, 1.08]

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

function createLegalVaultScene(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.62))

  const directionalLight = new THREE.DirectionalLight('#fff0d8', 2.5)
  directionalLight.position.set(3, 4.2, 4.5)
  scene.add(directionalLight)

  const orangeLight = new THREE.PointLight('#ff5a1f', 1.25)
  orangeLight.position.set(-2.8, 1.6, 2.8)
  scene.add(orangeLight)

  const limeLight = new THREE.PointLight('#d9ff74', 0.65)
  limeLight.position.set(2.4, -1.8, 2.2)
  scene.add(limeLight)

  const root = new THREE.Group()
  const vault = new THREE.Group()
  const bolt = new THREE.Group()
  const ledger = new THREE.Group()
  const slab = new THREE.Group()

  root.position.set(0, 0.02, 0)
  vault.position.set(-0.18, 0.04, 0)
  vault.rotation.set(-0.05, -0.08, 0)
  bolt.position.set(0, 0, 0.19)
  slab.position.set(1.72, -0.72, -0.12)
  slab.rotation.set(0.06, -0.24, -0.04)
  ledger.position.set(-1.92, -1.04, -0.12)
  ledger.rotation.set(0.03, 0.24, 0)

  const geometries = {
    bar: new THREE.BoxGeometry(0.18, 1, 0.18),
    bolt: new THREE.CylinderGeometry(0.09, 0.09, 0.07, 20),
    coin: new THREE.CylinderGeometry(0.18, 0.18, 0.052, 28),
    door: new THREE.CylinderGeometry(1.24, 1.24, 0.2, 64),
    handle: new THREE.CylinderGeometry(0.22, 0.22, 0.14, 32),
    ringLarge: new THREE.TorusGeometry(1.28, 0.035, 10, 72),
    ringSmall: new THREE.TorusGeometry(0.64, 0.026, 8, 56),
    slab: new THREE.BoxGeometry(1.18, 0.58, 0.16),
    spoke: new THREE.BoxGeometry(0.12, 1.05, 0.08),
  }

  const materials = {
    bar: new THREE.MeshStandardMaterial({ color: '#d9ff74', emissive: '#4b6200', emissiveIntensity: 0.12, roughness: 0.36 }),
    bolt: new THREE.MeshStandardMaterial({ color: '#f7f2e8', metalness: 0.5, roughness: 0.28 }),
    coin: new THREE.MeshStandardMaterial({ color: '#ff8a3d', emissive: '#5c1a00', emissiveIntensity: 0.12, metalness: 0.58, roughness: 0.24 }),
    door: new THREE.MeshStandardMaterial({ color: '#15130f', metalness: 0.45, roughness: 0.34 }),
    handle: new THREE.MeshStandardMaterial({ color: '#ff5a1f', emissive: '#621700', emissiveIntensity: 0.18, metalness: 0.48, roughness: 0.24 }),
    ring: new THREE.MeshStandardMaterial({ color: '#f7f2e8', emissive: '#ff5a1f', emissiveIntensity: 0.06, metalness: 0.38, roughness: 0.26 }),
    slab: new THREE.MeshStandardMaterial({ color: '#d9ff74', emissive: '#405600', emissiveIntensity: 0.1, roughness: 0.42 }),
    spoke: new THREE.MeshStandardMaterial({ color: '#ffb26d', emissive: '#4c1400', emissiveIntensity: 0.1, metalness: 0.34, roughness: 0.3 }),
  }

  vault.add(createMesh(geometries.door, materials.door, undefined, [Math.PI / 2, 0, 0]))
  vault.add(createMesh(geometries.ringLarge, materials.ring, [0, 0, 0.14]))
  vault.add(createMesh(geometries.ringSmall, materials.ring, [0, 0, 0.155]))

  spokeAngles.forEach((angle) => {
    bolt.add(createMesh(geometries.spoke, materials.spoke, [0, 0, 0], [0, 0, angle]))
  })
  bolt.add(createMesh(geometries.handle, materials.handle, undefined, [Math.PI / 2, 0, 0]))
  spokeAngles.forEach((angle) => {
    bolt.add(createMesh(geometries.bolt, materials.bolt, [Math.cos(angle) * 0.96, Math.sin(angle) * 0.96, 0.02], [Math.PI / 2, 0, 0]))
  })

  vault.add(bolt)
  root.add(vault)

  slab.add(createMesh(geometries.slab, materials.slab, [0, 0.18, 0]))
  slab.add(createMesh(geometries.coin, materials.coin, [-0.38, 0.62, 0.12], [Math.PI / 2, 0, 0.24]))
  slab.add(createMesh(geometries.coin, materials.coin, [0.2, 0.66, 0.12], [Math.PI / 2, 0, -0.18], 0.86))
  root.add(slab)

  ledgerBars.forEach((height, index) => {
    ledger.add(
      createMesh(
        geometries.bar,
        index === 2 ? materials.handle : materials.bar,
        [index * 0.3, height / 2, 0],
        undefined,
        [1, height, 1]
      )
    )
  })
  root.add(ledger)
  scene.add(root)

  return {
    update(time: number) {
      vault.rotation.y = Math.sin(time * 0.26) * 0.1
      vault.position.y = Math.sin(time * 0.44) * 0.04
      bolt.rotation.z = time * 0.1
      ledger.children.forEach((child, index) => {
        child.scale.y = 0.94 + Math.sin(time * 0.88 + index) * 0.07
      })
    },
  }
}

export default function LegalVaultSceneCanvas({ className }: DecorativeSceneCanvasProps) {
  return (
    <DecorativeThreeSceneCanvas
      camera={legalCamera}
      className={className}
      createScene={createLegalVaultScene}
      minHeightClass="min-h-[240px]"
    />
  )
}
