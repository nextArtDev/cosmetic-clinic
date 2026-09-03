'use client'

import { Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import { EffectMesh } from './effect-mesh'
import type { RenderTier } from './render-capability'
import type { TransitionEffect } from './types'

export interface ShaderStageProps {
  effect: TransitionEffect
  beforeSrc: string
  afterSrc: string
  hasRealBefore: boolean
  seed: number
  centerY: number
  tier: RenderTier
  progress: MotionValue<number>
  preview: MotionValue<number | null>
  reduceAmbientMotion: boolean
  /** Called once the first frame is on screen, to cross-fade off the fallback. */
  onReady?: () => void
  /** Called if the driver drops this context, so the provider can demote. */
  onContextLost?: () => void
}

/**
 * Owns one WebGL context. Dynamically imported, so devices that land on a CSS
 * tier never download three.js, @react-three/fiber or drei at all.
 *
 * `frameloop="demand"` is the important setting: with ambient motion frozen
 * (or on the lite tier) the canvas renders only when scroll actually moves it,
 * so a parked page costs zero GPU. Continuous rendering of eight canvases was
 * a large part of the "lagging" report.
 */
export default function ShaderStage({
  effect,
  beforeSrc,
  afterSrc,
  hasRealBefore,
  seed,
  centerY,
  tier,
  progress,
  preview,
  reduceAmbientMotion,
  onReady,
  onContextLost,
}: ShaderStageProps) {
  const continuous = tier === 'shader-high' && !reduceAmbientMotion

  return (
    <Canvas
      frameloop={continuous ? 'always' : 'demand'}
      dpr={tier === 'shader-high' ? [1, 2] : 1}
      flat
      gl={{
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference:
          tier === 'shader-high' ? 'high-performance' : 'default',
      }}
      performance={{ min: 0.5 }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement
        canvas.addEventListener(
          'webglcontextlost',
          (event) => {
            // Preventing the default is what allows a restore at all; we still
            // demote, because a context loss here means we asked for too much.
            event.preventDefault()
            onContextLost?.()
          },
          { once: true },
        )
      }}
    >
      <AdaptiveDpr pixelated={false} />
      <ScrubInvalidator
        progress={progress}
        preview={preview}
        enabled={!continuous}
      />
      <ReadySignal onReady={onReady} />
      <Suspense fallback={null}>
        <EffectMesh
          effect={effect}
          beforeSrc={beforeSrc}
          afterSrc={afterSrc}
          hasRealBefore={hasRealBefore}
          seed={seed}
          centerY={centerY}
          tier={tier}
          progress={progress}
          preview={preview}
          reduceAmbientMotion={reduceAmbientMotion}
        />
      </Suspense>
    </Canvas>
  )
}

/** On the demand loop, scrub input is the only thing that should wake a render. */
function ScrubInvalidator({
  progress,
  preview,
  enabled,
}: {
  progress: MotionValue<number>
  preview: MotionValue<number | null>
  enabled: boolean
}) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!enabled) return
    const unsubProgress = progress.on('change', () => invalidate())
    const unsubPreview = preview.on('change', () => invalidate())
    invalidate()
    return () => {
      unsubProgress()
      unsubPreview()
    }
  }, [enabled, invalidate, preview, progress])

  return null
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  const [done, setDone] = useState(false)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    if (done) return
    // Two frames: one to compile and upload, one to actually present.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setDone(true)
        onReady?.()
      }),
    )
    return () => cancelAnimationFrame(raf)
  }, [done, gl, onReady])

  return null
}
