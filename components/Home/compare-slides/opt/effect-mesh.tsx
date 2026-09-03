'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import { getFragmentShaders, VERT } from './shaders'
import type { RenderTier } from './render-capability'
import type { TransitionEffect } from './types'

export interface EffectMeshProps {
  effect: TransitionEffect
  beforeSrc: string
  afterSrc: string
  hasRealBefore: boolean
  seed: number
  centerY: number
  tier: RenderTier
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
  tier,
  progress,
  preview,
  reduceAmbientMotion,
}: EffectMeshProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const frozenTimeRef = useRef(0)
  const { gl, size, invalidate } = useThree()

  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl])
  const wantAniso = tier === 'shader-high' ? 8 : 2

  // Configure in place; never clone. `clone()` produces a second GPU upload of
  // the same bitmap, so eight stages × two photos became 32 uploads and blew
  // past the VRAM a mid-range phone has for textures.
  const [beforeTex, afterTex] = useTexture([beforeSrc, afterSrc], (loaded) => {
    const list = (Array.isArray(loaded) ? loaded : [loaded]) as THREE.Texture[]
    for (const texture of list) {
      texture.anisotropy = Math.min(maxAniso, wantAniso)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    }
    invalidate()
  }) as [THREE.Texture, THREE.Texture]

  const fragmentShader = useMemo(
    () => getFragmentShaders(tier)[effect],
    [tier, effect],
  )

  const uniforms = useMemo(
    () => ({
      uBefore: { value: beforeTex },
      uAfter: { value: afterTex },
      uRealBefore: { value: hasRealBefore ? 1 : 0 },
      uImgAspect: {
        value:
          ((afterTex?.image as { width?: number } | null)?.width ?? 1024) /
          ((afterTex?.image as { height?: number } | null)?.height ?? 1024),
      },
      uPlaneAspect: { value: 0.8 },
      uProgress: { value: progress.get() },
      uTime: { value: 0 },
      uSeed: { value: seed },
      uCenterY: { value: centerY },
    }),
    // `progress` is read once for the initial value only; it's a stable ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [beforeTex, afterTex, hasRealBefore, seed, centerY],
  )

  // Aspect is a resize concern, not a per-frame one. Recomputing it inside
  // useFrame forced a uniform upload on every single frame for no reason.
  useEffect(() => {
    const material = materialRef.current
    if (!material) return
    material.uniforms.uPlaneAspect.value = size.width / size.height
    invalidate()
  }, [size.width, size.height, invalidate])

  useFrame((state) => {
    const material = materialRef.current
    if (!material) return
    const overridden = preview.get()
    material.uniforms.uProgress.value = overridden ?? progress.get()
    if (!reduceAmbientMotion) {
      frozenTimeRef.current = state.clock.elapsedTime
      material.uniforms.uTime.value = frozenTimeRef.current
    }
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        // Tier is part of the key: a demotion must recompile, not silently
        // keep the expensive program alive.
        key={`${effect}-${tier}`}
        ref={materialRef}
        vertexShader={VERT}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
