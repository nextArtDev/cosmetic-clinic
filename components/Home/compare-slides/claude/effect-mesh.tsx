'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import { FRAGMENT_SHADERS, VERT } from './shaders'
import type { TransitionEffect } from './types'

export interface EffectMeshProps {
  effect: TransitionEffect
  beforeSrc: string
  afterSrc: string
  hasRealBefore: boolean
  seed: number
  centerY: number
  /** Raw scroll progress, read every frame for 1:1 scrub sync. */
  progress: MotionValue<number>
  /** Hold-to-preview override; null means "use `progress` instead". */
  preview: MotionValue<number | null>
  /** Freezes uTime-driven ambient motion (sparkle, ripple) for a11y. */
  reduceAmbientMotion: boolean
}

export function EffectMesh({
  effect,
  beforeSrc,
  afterSrc,
  hasRealBefore,
  seed,
  centerY,
  progress,
  preview,
  reduceAmbientMotion,
}: EffectMeshProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const frozenTimeRef = useRef(0)
  const [beforeTex, afterTex] = useTexture([beforeSrc, afterSrc]) as [
    THREE.Texture,
    THREE.Texture,
  ]

  const beforeTexAniso = useMemo(() => {
    if (!beforeTex) return beforeTex
    const clone = beforeTex.clone()
    clone.anisotropy = 8
    return clone
  }, [beforeTex])

  const afterTexAniso = useMemo(() => {
    if (!afterTex) return afterTex
    const clone = afterTex.clone()
    clone.anisotropy = 8
    return clone
  }, [afterTex])

  const uniforms = useMemo(
    () => ({
      uBefore: { value: beforeTexAniso },
      uAfter: { value: afterTexAniso },
      uRealBefore: { value: hasRealBefore ? 1 : 0 },
      uImgAspect: {
        value:
          ((afterTexAniso?.image as { width?: number } | null)?.width ?? 1024) /
          ((afterTexAniso?.image as { height?: number } | null)?.height ??
            1024),
      },
      uPlaneAspect: { value: 0.8 },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSeed: { value: seed },
      uCenterY: { value: centerY },
    }),
    [beforeTexAniso, afterTexAniso, hasRealBefore, seed, centerY],
  )

  useFrame((state) => {
    const material = materialRef.current
    if (!material) return
    const overridden = preview.get()
    material.uniforms.uProgress.value = overridden ?? progress.get()
    if (!reduceAmbientMotion) {
      frozenTimeRef.current = state.clock.elapsedTime
    }
    material.uniforms.uTime.value = frozenTimeRef.current
    material.uniforms.uPlaneAspect.value = state.size.width / state.size.height
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        key={effect}
        ref={materialRef}
        vertexShader={VERT}
        fragmentShader={FRAGMENT_SHADERS[effect]}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
