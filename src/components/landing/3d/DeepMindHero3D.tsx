'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Stars, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

function NeuralNetwork() {
  const count = 150
  const points = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10
      p[i * 3 + 1] = (Math.random() - 0.5) * 10
      p[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return p
  }, [count])

  const linesRef = useRef<THREE.LineSegments>(null)
  const pointsRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (linesRef.current && pointsRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      linesRef.current.rotation.x = state.clock.elapsedTime * 0.02
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02
    }
  })

 
  const indices = useMemo(() => {
    const idx = []
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = points[i * 3] - points[j * 3]
        const dy = points[i * 3 + 1] - points[j * 3 + 1]
        const dz = points[i * 3 + 2] - points[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < 2.5) {
          idx.push(i, j)
        }
      }
    }
    return new Uint16Array(idx)
  }, [points])

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#10B981" transparent opacity={0.8} sizeAttenuation />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
          <bufferAttribute attach="index" args={[indices, 1]} />
        </bufferGeometry>
        <lineBasicMaterial color="#3B82F6" transparent opacity={0.15} />
      </lineSegments>
    </group>
  )
}

function FloatingCube() {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.3
      mesh.current.rotation.y = state.clock.elapsedTime * 0.4
    }
  })

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={mesh} position={[2, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial 
          color="#222" 
          metalness={0.9} 
          roughness={0.1} 
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1.5, 1.5, 1.5)]} />
          <lineBasicMaterial color="#10B981" attach="material" linewidth={2} />
        </lineSegments>
      </mesh>
    </Float>
  )
}

export default function DeepMindHero3D() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={isDark ? 0.2 : 0.8} />
        <pointLight position={[10, 10, 10]} intensity={isDark ? 1 : 1.5} color="#10B981" />
        <pointLight position={[-10, -10, -10]} intensity={isDark ? 0.5 : 1} color="#3B82F6" />
        
        <NeuralNetwork />
        {}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  )
}
