'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { SceneFallback } from './SceneFallback'
import type { DecorativeSceneCanvasProps, DecorativeSceneProps } from './types'
import { useDecorativeSceneEnabled } from './useDecorativeSceneEnabled'

const AuthTrustSceneCanvas = dynamic<DecorativeSceneCanvasProps>(
  () => import('./AuthTrustSceneCanvas'),
  {
    ssr: false,
    loading: () => <SceneFallback variant="auth" className="absolute inset-0" />,
  }
)

export function AuthTrustScene({ className }: DecorativeSceneProps) {
  const enabled = useDecorativeSceneEnabled()

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none relative min-h-[260px] overflow-hidden rounded-[var(--public-radius-lg)]', className)}
    >
      <SceneFallback
        variant="auth"
        className={cn('absolute inset-0 transition-opacity duration-500', enabled ? 'opacity-0' : 'opacity-100')}
      />
      {enabled ? <AuthTrustSceneCanvas className="absolute inset-0" /> : null}
    </div>
  )
}

export default AuthTrustScene
