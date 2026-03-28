'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Float, Sparkles, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

function GlassDiamond({ position, scale }: { position: [number, number, number], scale: number }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.2
      mesh.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial 
          backside
          samples={2}
          thickness={1.5}
          chromaticAberration={0.05}
          anisotropy={0.2}
          distortion={0}
          distortionScale={0}
          temporalDistortion={0}
          iridescence={0}
          clearcoat={1}
          roughness={0.15}
          transmission={0.9}
          ior={1.5}
          color="#ffffff"
        />
        {}
        <mesh scale={0.5}>
          <icosahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color="#3B82F6" emissive="#1D4ED8" emissiveIntensity={2} roughness={0.4} />
        </mesh>
      </mesh>
    </Float>
  )
}

function FloatingCoin({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.elapsedTime * 0.5
      mesh.current.rotation.x = Math.PI / 2
      mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={mesh} position={position}>
        <cylinderGeometry args={[1, 1, 0.15, 64]} />
        <meshStandardMaterial 
          color="#10B981" 
          metalness={1} 
          roughness={0.2}
          envMapIntensity={2}
        />
        {}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.01, 32]} />
          <meshStandardMaterial color="#059669" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.01, 32]} />
          <meshStandardMaterial color="#059669" metalness={0.8} roughness={0.4} />
        </mesh>
      </mesh>
    </Float>
  )
}

function DataStreams() {
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#3B82F6', transparent: true, opacity: 0.3 })
  const lines = useMemo(() => {
    const arr = []
    for (let i = 0; i < 5; i++) {
        const points = []
        let x = -10
        let y = (Math.random() - 0.5) * 10
        let z = (Math.random() - 0.5) * 10
        for(let j=0; j<10; j++) {
            points.push(new THREE.Vector3(x, y, z))
            x += 2 + Math.random() * 2
            y += (Math.random() - 0.5) * 2
            z += (Math.random() - 0.5) * 2
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const lineObj = new THREE.Line(geometry, lineMaterial)
        arr.push(<primitive key={i} object={lineObj} />)
    }
    return arr
  }, [])

  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (group.current) {
      group.current.position.x = (group.current.position.x + 0.02) % 10
    }
  })

  return <group ref={group} position={[-5, 0, -5]}>{lines}</group>
}

function Rig() {
  const { camera, pointer } = useThree()
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 2, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 2, 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function FinanceWorld3D() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-1000">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
        
        {}
        <ambientLight intensity={isDark ? 0.3 : 1} />
        <spotLight position={[10, 20, 10]} penumbra={1} intensity={isDark ? 2 : 4} color="#ffffff" castShadow />
        <spotLight position={[-10, -20, -10]} penumbra={1} intensity={isDark ? 1 : 2} color="#10B981" />
        <pointLight position={[0, 0, 5]} intensity={isDark ? 0.5 : 1} color="#3B82F6" />

        <Rig />

        {}
        <GlassDiamond position={[-3, 1, -2]} scale={1.5} />
        <GlassDiamond position={[4, -2, -4]} scale={1} />
        <FloatingCoin position={[3, 2, -1]} />
        <FloatingCoin position={[-4, -2, -3]} />
        
        <DataStreams />

        {}
        <Sparkles count={50} scale={20} size={isDark ? 2 : 4} speed={0.4} opacity={isDark ? 0.3 : 0.6} color="#10B981" />

        {}
        <Environment resolution={128}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <spotLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
            <spotLight position={[5, 5, 5]} intensity={1.5} color="#3B82F6" />
            <spotLight position={[-5, 5, -5]} intensity={1.5} color="#10B981" />
            <mesh scale={100}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color={isDark ? "#020617" : "#FFFFFF"} side={THREE.BackSide} />
            </mesh>
          </group>
        </Environment>
      </Canvas>
    </div>
  )
}
