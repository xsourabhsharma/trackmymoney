'use client'

import { useEffect, useState } from 'react'

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function useDecorativeSceneEnabled() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compactViewport = window.matchMedia('(max-width: 767px)')

    const update = () => {
      setEnabled(!reducedMotion.matches && !compactViewport.matches && supportsWebGL())
    }

    update()
    reducedMotion.addEventListener('change', update)
    compactViewport.addEventListener('change', update)

    return () => {
      reducedMotion.removeEventListener('change', update)
      compactViewport.removeEventListener('change', update)
    }
  }, [])

  return enabled
}
