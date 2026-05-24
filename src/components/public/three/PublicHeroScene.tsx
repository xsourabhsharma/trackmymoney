'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { SceneFallback } from './SceneFallback'
import type { DecorativeSceneCanvasProps, DecorativeSceneProps } from './types'
import { useDecorativeSceneEnabled } from './useDecorativeSceneEnabled'

const PublicHeroSceneCanvas = dynamic<DecorativeSceneCanvasProps>(
  () => import('./PublicHeroSceneCanvas'),
  {
    ssr: false,
    loading: () => <SceneFallback variant="hero" className="absolute inset-0" />,
  }
)

export function PublicHeroScene({ className }: DecorativeSceneProps) {
  const enabled = useDecorativeSceneEnabled()

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none relative min-h-[260px] overflow-hidden rounded-[var(--public-radius-lg)]', className)}
    >
      <SceneFallback
        variant="hero"
        className={cn('absolute inset-0 transition-opacity duration-500', enabled ? 'opacity-0' : 'opacity-100')}
      />
      {enabled ? <PublicHeroSceneCanvas className="absolute inset-0" /> : null}
    </div>
  )
}

export default PublicHeroScene
