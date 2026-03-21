'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Float, MeshTransmissionMaterial, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

function GlassCard({ position, rotation, scale, color }: any) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x += 0.002
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5} floatingRange={[-0.2, 0.2]}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[2, 3, 0.1]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.1}
          thickness={0.5}
          roughness={0.05}
          transmission={1}
          ior={1.2}
          chromaticAberration={0.04}
          anisotropy={0.1}
          color={color}
        />
        {/* Subtle glowing edge */}
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(2, 3, 0.1)]} />
          <lineBasicMaterial color={color} attach="material" linewidth={2} transparent opacity={0.3} />
        </lineSegments>
      </mesh>
    </Float>
  )
}

function GlassCoin({ position, rotation, scale, color }: any) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.z += 0.005
    }
  })

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2} floatingRange={[-0.3, 0.3]}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.1}
          thickness={0.5}
          roughness={0.1}
          transmission={1}
          ior={1.5}
          chromaticAberration={0.08}
          color={color}
        />
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.CylinderGeometry(1, 1, 0.2, 32)]} />
          <lineBasicMaterial color={color} attach="material" transparent opacity={0.4} />
        </lineSegments>
      </mesh>
    </Float>
  )
}

function RisingBar({ position, scale, color, speedOffset }: any) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Simulate data bars rising and falling gently
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speedOffset) * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[0.8, 4, 0.8]} />
      <meshPhysicalMaterial 
        color={color} 
        metalness={0.8} 
        roughness={0.2} 
        clearcoat={1} 
        transparent 
        opacity={0.8} 
      />
    </mesh>
  )
}

export default function FinanceHero3D() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
        <ambientLight intensity={isDark ? 0.3 : 0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={isDark ? 2 : 1.5} color="#10B981" />
        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={isDark ? 2 : 1} color="#3B82F6" />
        
        <Environment preset="city" />

        {/* Abstract 3D Finance Elements */}
        
        {/* Central/Right Data Flow */}
        <group position={[4, -1, -2]} rotation={[0.2, -0.4, 0]}>
          <RisingBar position={[-1.5, 0, 0]} scale={[1, 0.5, 1]} color="#10B981" speedOffset={1.2} />
          <RisingBar position={[0, 0.5, -1]} scale={[1, 0.8, 1]} color="#3B82F6" speedOffset={0.8} />
          <RisingBar position={[1.5, 1, 0]} scale={[1, 1.2, 1]} color="#F59E0B" speedOffset={1.5} />
        </group>

        {/* Floating Glass Credit Cards */}
        <GlassCard 
          position={[-5, 2, -3]} 
          rotation={[0.4, 0.5, 0.2]} 
          scale={[1.5, 1.5, 1.5]} 
          color={isDark ? "#3B82F6" : "#60A5FA"} 
        />
        <GlassCard 
          position={[5, 3, -5]} 
          rotation={[-0.2, -0.6, -0.1]} 
          scale={[1.2, 1.2, 1.2]} 
          color={isDark ? "#10B981" : "#34D399"} 
        />

        {/* Floating Glass Coins (Tokens/Currency) */}
        <GlassCoin 
          position={[-3, -2, -1]} 
          rotation={[1.2, 0.4, 0]} 
          scale={[0.8, 0.8, 0.8]} 
          color="#F59E0B" 
        />
        <GlassCoin 
          position={[3, -3, 1]} 
          rotation={[0.8, -0.5, 0.2]} 
          scale={[0.6, 0.6, 0.6]} 
          color="#10B981" 
        />
        <GlassCoin 
          position={[-6, -1, -4]} 
          rotation={[0.5, 0.8, -0.2]} 
          scale={[1, 1, 1]} 
          color="#8B5CF6" 
        />

        {/* Soft shadow plane below the shapes */}
        <ContactShadows position={[0, -4, 0]} opacity={isDark ? 0.4 : 0.1} scale={20} blur={2} far={4} />

      </Canvas>
    </div>
  )
}
