'use client'

/**
 * Answers "will this device handle the shaders well" with a measurement,
 * not a device allowlist. UA/model sniffing is both unreliable (spoofable,
 * stale the day a new chipset ships) and unfair — plenty of "old" phones
 * have perfectly capable GPUs, and plenty of "new" budget phones don't.
 * Instead this renders one of the app's actual fbm-heavy fragment shaders
 * at a tiny resolution and times it, so the classification tracks real
 * rendering cost on *this* GPU, on *this* day.
 */

export type DeviceTier = 'high' | 'mid' | 'low'

export interface DeviceTierResult {
  tier: DeviceTier
  webglVersion: 1 | 2 | null
  renderer: string | null
  benchmarkMs: number | null
  /** Why this tier was chosen — useful in telemetry, not shown to users. */
  reason: string
}

const LOW_TIER_RENDERER_PATTERNS: RegExp[] = [
  /mali-4\d\d/i,
  /mali-3\d\d/i,
  /mali-t7/i,
  /adreno \(tm\) [23]\d\d/i,
  /powervr sgx/i,
  /videocore iv/i,
  /swiftshader/i, // software rasterizer — always treat as low, GPU isn't actually engaged
]

function readGpuRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext): string | null {
  const ext = gl.getExtension('WEBGL_debug_renderer_info')
  if (!ext) return null
  try {
    return (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string) ?? null
  } catch {
    return null
  }
}

/** Compiles a minimal shader using the same `fbm()` two of our real
 *  transitions (dissolve, ink) lean on hardest, draws it a handful of
 *  times at 96×96, and times the round trip with `gl.finish()` forcing
 *  the GPU to actually complete the work before the clock stops. */
function benchmarkFbmCost(gl: WebGLRenderingContext): number | null {
  try {
    const vs = gl.createShader(gl.VERTEX_SHADER)
    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    if (!vs || !fs) return null

    gl.shaderSource(
      vs,
      `attribute vec2 position;
       void main(){ gl_Position = vec4(position, 0.0, 1.0); }`,
    )
    gl.compileShader(vs)

    gl.shaderSource(
      fs,
      `precision mediump float;
       uniform float uSeed;
       float hash21(vec2 p){
         p = fract(p * vec2(234.34, 435.345));
         p += dot(p, p + 34.23);
         return fract(p.x * p.y);
       }
       float vnoise(vec2 p){
         vec2 i = floor(p); vec2 f = fract(p);
         f = f * f * (3.0 - 2.0 * f);
         float a = hash21(i);
         float b = hash21(i + vec2(1.0, 0.0));
         float c = hash21(i + vec2(0.0, 1.0));
         float d = hash21(i + vec2(1.0, 1.0));
         return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
       }
       float fbm(vec2 p){
         float v = 0.0; float a = 0.5;
         for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
         return v;
       }
       void main(){
         vec2 uv = gl_FragCoord.xy / 96.0;
         float n = fbm(uv * 8.0 + uSeed) + fbm(uv * 21.0 + uSeed * 2.0);
         gl_FragColor = vec4(vec3(n), 1.0);
       }`,
    )
    gl.compileShader(fs)

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS) || !gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      return null
    }

    const program = gl.createProgram()
    if (!program) return null
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    // one oversized triangle covering the viewport — cheaper than a quad
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    gl.viewport(0, 0, 96, 96)
    gl.useProgram(program)
    const seedLoc = gl.getUniformLocation(program, 'uSeed')

    const FRAMES = 6
    const pixel = new Uint8Array(4)
    const start = performance.now()
    for (let i = 0; i < FRAMES; i++) {
      gl.uniform1f(seedLoc, i * 1.37)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    gl.finish() // block until the GPU actually finishes — draw calls alone are async
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel) // guards against a driver skipping unread work
    const elapsedMs = performance.now() - start

    gl.deleteProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteBuffer(buffer)

    return elapsedMs / FRAMES
  } catch {
    return null
  }
}

/** Runs once, synchronously, on whatever thread calls it — callers should
 *  invoke this from an idle callback (see `useDeviceTier`) so it never
 *  competes with first paint. */
export function classifyDeviceTier(): DeviceTierResult {
  if (typeof window === 'undefined') {
    return { tier: 'high', webglVersion: null, renderer: null, benchmarkMs: null, reason: 'ssr' }
  }

  const canvas = document.createElement('canvas')
  const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null
  const gl = gl2 ?? (canvas.getContext('webgl') as WebGLRenderingContext | null)
  if (!gl) {
    return { tier: 'low', webglVersion: null, renderer: null, benchmarkMs: null, reason: 'no-webgl' }
  }

  const renderer = readGpuRenderer(gl)
  const webglVersion: 1 | 2 = gl2 ? 2 : 1

  if (renderer && LOW_TIER_RENDERER_PATTERNS.some((pattern) => pattern.test(renderer))) {
    return { tier: 'low', webglVersion, renderer, benchmarkMs: null, reason: `known-low-tier-gpu:${renderer}` }
  }

  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  if (cores <= 2 && memory <= 2) {
    return { tier: 'low', webglVersion, renderer, benchmarkMs: null, reason: 'low-cores-and-memory' }
  }

  const benchmarkMs = benchmarkFbmCost(gl)
  if (benchmarkMs === null) {
    const tier: DeviceTier = cores >= 6 && memory >= 4 ? 'high' : 'mid'
    return { tier, webglVersion, renderer, benchmarkMs, reason: 'benchmark-failed-heuristic-fallback' }
  }

  if (benchmarkMs < 3) return { tier: 'high', webglVersion, renderer, benchmarkMs, reason: 'benchmark' }
  if (benchmarkMs < 9) return { tier: 'mid', webglVersion, renderer, benchmarkMs, reason: 'benchmark' }
  return { tier: 'low', webglVersion, renderer, benchmarkMs, reason: 'benchmark' }
}
