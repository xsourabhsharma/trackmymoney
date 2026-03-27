'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedOrb({ state }: { state: 'neutral' | 'warning' | 'opportunity' | 'no_data' }) {
  const meshRef = useRef<THREE.Mesh>(null)

 
  let color = '#3B82F6'
  let distort = 0.3
  let speed = 2

  switch (state) {
    case 'warning':
      color = '#EF4444'
      distort = 0.6
      speed = 4
      break
    case 'opportunity':
      color = '#10B981'
      distort = 0.4
      speed = 3
      break
    case 'no_data':
      color = '#9CA3AF'
      distort = 0.1
      speed = 1
      break
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed}
          roughness={0.2}
          metalness={0.8}
          wireframe={state === 'no_data'}
        />
      </Sphere>
      {}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} color={color} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
    </Float>
  )
}

export function AiOrb3D({ state = 'neutral' }: { state?: 'neutral' | 'warning' | 'opportunity' | 'no_data' }) {
  return (
    <div className="w-full h-[200px] relative pointer-events-none rounded-t-[32px] overflow-hidden bg-gradient-to-b from-black/5 to-transparent">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <AnimatedOrb state={state} />
      </Canvas>
    </div>
  )
}
