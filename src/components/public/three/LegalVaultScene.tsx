'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { SceneFallback } from './SceneFallback'
import type { DecorativeSceneCanvasProps, DecorativeSceneProps } from './types'
import { useDecorativeSceneEnabled } from './useDecorativeSceneEnabled'

const LegalVaultSceneCanvas = dynamic<DecorativeSceneCanvasProps>(
  () => import('./LegalVaultSceneCanvas'),
  {
    ssr: false,
    loading: () => <SceneFallback variant="legal" className="absolute inset-0" />,
  }
)

export function LegalVaultScene({ className }: DecorativeSceneProps) {
  const enabled = useDecorativeSceneEnabled()

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none relative min-h-[240px] overflow-hidden rounded-[var(--public-radius-lg)]', className)}
    >
      <SceneFallback
        variant="legal"
        className={cn('absolute inset-0 transition-opacity duration-500', enabled ? 'opacity-0' : 'opacity-100')}
      />
      {enabled ? <LegalVaultSceneCanvas className="absolute inset-0" /> : null}
    </div>
  )
}

export default LegalVaultScene
