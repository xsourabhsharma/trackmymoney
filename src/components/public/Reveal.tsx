'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'

export type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number
  duration?: number
  once?: boolean
  y?: number
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.55,
  once = true,
  transition,
  viewport,
  y = 18,
  ...props
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      animate={shouldReduceMotion ? { opacity: 1 } : undefined}
      viewport={{ once, amount: 0.22, ...viewport }}
      transition={{
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1],
        ...transition,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
