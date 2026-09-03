'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import {
  useScroll,
  useMotionValueEvent,
  useTransform,
  useReducedMotion,
  motion,
  type MotionValue,
} from 'framer-motion'
import * as THREE from 'three'
import { StaticImageData } from 'next/image'

export type ShaderVariant =
  | 'liquid'
  | 'circle'
  | 'wave'
  | 'smoke'
  | 'blinds'
  | 'diagonal'
  | 'crystalline'
  | 'iris'
  | 'ripple'
  | 'glitch'

// --- Shared GLSL Functions ---
const commonGLSL = `
  varying vec2 vUv;
  uniform float uProgress;
  uniform sampler2D uBefore;
  uniform sampler2D uAfter;
  uniform vec2 uResolution;
  uniform vec2 uImageRes;

  // Simplex Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  vec2 coverUv(vec2 uv, vec2 res, vec2 imgRes) {
    vec2 ratio = vec2(
        min((res.x / res.y) / (imgRes.x / imgRes.y), 1.0),
        min((imgRes.x / imgRes.y) / (res.x / res.y), 1.0)
    );
    return vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
  }

  // Add a luxury glowing gold edge to the transition
  vec3 applyEdge(float mask, vec3 color) {
    float edge = length(fwidth(mask));
    vec3 edgeColor = vec3(0.9, 0.8, 0.6); // Warm gold light
    return mix(color, edgeColor, clamp(edge * 5.0, 0.0, 1.0));
  }
`

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// --- 10 Fragment Shader Variants ---
const fragmentShaders: Record<ShaderVariant, string> = {
  liquid: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float noise = snoise(vUv * 3.0 + uProgress * 2.0) * 0.15;
      float threshold = uProgress + noise;
      float mask = smoothstep(threshold - 0.05, threshold + 0.05, vUv.x);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  circle: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float dist = distance(vUv, vec2(0.5));
      float mask = 1.0 - smoothstep(uProgress * 0.8 - 0.05, uProgress * 0.8 + 0.05, dist);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  wave: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float wave = sin(vUv.y * 10.0 + uProgress * 5.0) * 0.05;
      float threshold = uProgress + wave;
      float mask = smoothstep(threshold - 0.02, threshold + 0.02, vUv.x);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  smoke: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float n1 = snoise(vUv * 4.0 + uProgress);
      float n2 = snoise(vUv * 8.0 - uProgress);
      float noise = (n1 + n2 * 0.5) * 0.2;
      float mask = smoothstep(uProgress + noise - 0.05, uProgress + noise + 0.05, 1.0 - vUv.x);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  blinds: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float band = floor(vUv.y * 12.0);
      float rand = random(vec2(band, 1.0));
      float localProgress = clamp((uProgress - rand * 0.5) * 2.0, 0.0, 1.0);
      float mask = smoothstep(localProgress - 0.05, localProgress + 0.05, vUv.x);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  diagonal: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float diag = (vUv.x + vUv.y) * 0.5;
      float mask = smoothstep(uProgress - 0.05, uProgress + 0.05, diag);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  crystalline: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      vec2 grid = floor(vUv * 10.0);
      float rand = random(grid);
      float mask = 1.0 - smoothstep(rand * 0.8, rand * 0.8 + 0.1, uProgress);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  iris: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float dist = distance(vUv, vec2(0.5));
      float maxDist = distance(vec2(0.0), vec2(0.5));
      float prog = uProgress * maxDist * 2.0;
      float mask = smoothstep(prog, prog + 0.05, dist);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  ripple: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float dist = distance(vUv, vec2(0.5));
      float wave = sin(dist * 30.0 - uProgress * 10.0) * 0.1;
      float threshold = uProgress + wave;
      float mask = smoothstep(threshold - 0.05, threshold + 0.05, dist);
      vec3 finalColor = mix(texture2D(uAfter, uv).rgb, texture2D(uBefore, uv).rgb, mask);
      gl_FragColor = vec4(applyEdge(mask, finalColor), 1.0);
    }
  `,
  glitch: `
    ${commonGLSL}
    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageRes);
      float glitch = step(0.9, random(vec2(floor(vUv.y * 15.0), floor(uProgress * 10.0))));
      float offset = glitch * 0.1 * sin(uProgress * 3.14);
      vec2 uvOffset = vUv + vec2(offset, 0.0);
      
      // Sample textures with glitch offset
      vec3 beforeColor = texture2D(uBefore, coverUv(uvOffset, uResolution, uImageRes)).rgb;
      vec3 afterColor = texture2D(uAfter, coverUv(uvOffset, uResolution, uImageRes)).rgb;
      
      float mask = smoothstep(uProgress - 0.02, uProgress + 0.02, uvOffset.x);
      vec3 finalColor = mix(afterColor, beforeColor, mask);
      
      // RGB Split for high-end editorial glitch
      float split = glitch * 0.02 * (1.0 - abs(uProgress - 0.5) * 2.0);
      finalColor.r = mix(texture2D(uAfter, coverUv(uvOffset + vec2(split, 0.0), uResolution, uImageRes)).rgb.r, texture2D(uBefore, coverUv(uvOffset + vec2(split, 0.0), uResolution, uImageRes)).rgb.r, mask);
      finalColor.b = mix(texture2D(uAfter, coverUv(uvOffset - vec2(split, 0.0), uResolution, uImageRes)).rgb.b, texture2D(uBefore, coverUv(uvOffset - vec2(split, 0.0), uResolution, uImageRes)).rgb.b, mask);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
}

// --- 3D Scene Component ---
interface SceneProps {
  before: StaticImageData
  after: StaticImageData
  progressRef: React.MutableRefObject<number>
  variant: ShaderVariant
}

function Scene({ before, after, progressRef, variant }: SceneProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()

  const [beforeTex, afterTex] = useTexture([before.src, after.src])

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uBefore: { value: beforeTex },
      uAfter: { value: afterTex },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uImageRes: {
        value: new THREE.Vector2(
          (beforeTex.image as { width: number }).width,
          (beforeTex.image as { height: number }).height,
        ),
      },
    }),
    [beforeTex, afterTex],
  )

  // Select shader based on variant prop
  const fragmentShader = useMemo(() => fragmentShaders[variant], [variant])

  useFrame(({ size }) => {
    if (matRef.current) {
      matRef.current.uniforms.uProgress.value = progressRef.current
      matRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

// --- Scroll-linked reveal title (replaces the GSAP-pinned PinnedTitle) ---
function RevealTitle({
  disease,
  progress,
}: {
  disease: string
  progress: MotionValue<number>
}) {
  const prefersReducedMotion = useReducedMotion()
  const logoClip = useTransform(
    progress,
    [0, 0.12],
    ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'],
  )
  const textY = useTransform(progress, [0.06, 0.2], ['-110%', '0%'])
  const textOpacity = useTransform(progress, [0.06, 0.2], [0, 1])

  if (prefersReducedMotion) {
    return (
      <header className="flex flex-col items-center gap-1">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-1">
          <h3 className="font-extralight text-lg text-neutral-100 sm:text-xl">
            {disease}
          </h3>
        </div>
        <p className="text-xs text-neutral-500">مقایسه قبل و بعد</p>
      </header>
    )
  }

  return (
    <header className="flex flex-col items-center gap-1">
      <motion.div
        style={{ clipPath: logoClip }}
        className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-1 backdrop-blur-sm"
      >
        <h3 className="font-extralight text-lg text-neutral-100 sm:text-xl">
          {disease}
        </h3>
      </motion.div>
      <div className="overflow-hidden">
        <motion.p
          style={{ y: textY, opacity: textOpacity }}
          className="text-xs text-neutral-500"
        >
          مقایسه قبل و بعد
        </motion.p>
      </div>
    </header>
  )
}

// --- Main Exported Component ---
interface ShaderCompareSliderProps {
  before: StaticImageData
  after: StaticImageData
  disease: string
  index: number
  variant?: ShaderVariant // Optional: defaults to 'liquid'
  /** Position in the stacked deck; drives the sticky top offset. */
  stackIndex?: number
}

export default function ShaderCompareSlider({
  before,
  after,
  disease,
  index,
  variant = 'liquid',
  stackIndex = 0,
}: ShaderCompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  const isReversed = index % 2 !== 0
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const mappedProgress = useTransform(scrollYProgress, (value) =>
    isReversed ? 1 - value : value,
  )

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const clamped = Math.max(0, Math.min(1, latest))
    progressRef.current = isReversed ? 1 - clamped : clamped
  })

  const beforeChipOpacity = useTransform(mappedProgress, [0.28, 0.48], [1, 0])
  const afterChipOpacity = useTransform(mappedProgress, [0.52, 0.74], [0, 1])

  return (
    <div
      ref={containerRef}
      className="relative h-[240vh]"
      style={{ zIndex: stackIndex + 1 }}
    >
      <div
        className="sticky flex h-dvh flex-col items-center justify-center gap-5 px-4 py-6"
        style={{ top: `${stackIndex * 28}px` }}
      >
        <RevealTitle disease={disease} progress={scrollYProgress} />

        <div className="relative flex w-full items-center justify-center">
          <div className="rounded-[22px] bg-[linear-gradient(150deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.16)_100%)] p-[1.5px] shadow-[0_36px_100px_-32px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="relative aspect-[4/5] h-[min(70dvh,calc((100vw-2rem)*1.25))] w-auto max-w-full select-none overflow-hidden rounded-[20.5px] bg-black">
              <Canvas
                className="absolute inset-0"
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 2]}
              >
                {/* <color attach="background" args={['##ca1515']} /> */}
                <Suspense fallback={null}>
                  <Scene
                    before={before}
                    after={after}
                    progressRef={progressRef}
                    variant={variant}
                  />
                </Suspense>
              </Canvas>

              <motion.div
                style={{ opacity: beforeChipOpacity }}
                className="pointer-events-none absolute start-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-[12px] font-light text-white shadow-lg backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                پیش از {disease}
              </motion.div>

              <motion.div
                style={{ opacity: afterChipOpacity }}
                className="pointer-events-none absolute end-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-[12px] font-light text-white shadow-lg backdrop-blur-md"
              >
                پس از {disease}
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
