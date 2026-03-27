'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
}

export function TiltCard({ children, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

 
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

 
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg'])

 
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['100%', '0%'])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['100%', '0%'])

  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    
    const width = rect.width
    const height = rect.height
    
   
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
   
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative w-full h-full rounded-2xl transition-shadow duration-300 ${
        isHovered ? 'shadow-2xl z-10' : 'shadow-sm z-0'
      } ${className}`}
    >
      <div 
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl mix-blend-overlay transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.8 : 0,
          background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`
        }}
      />
      <div 
        className="w-full h-full transform-gpu" 
        style={{ transform: 'translateZ(20px)' }}
      >
        {children}
      </div>
    </motion.div>
  )
}
