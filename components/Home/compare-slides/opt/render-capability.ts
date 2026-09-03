export type RenderTier =
  | 'shader-high'
  | 'shader-lite'
  | 'css-rich'
  | 'css-static'

export const TIER_ORDER: RenderTier[] = [
  'shader-high',
  'shader-lite',
  'css-rich',
  'css-static',
]

export const tierIndex = (t: RenderTier) => TIER_ORDER.indexOf(t)
export const isShaderTier = (t: RenderTier) =>
  t === 'shader-high' || t === 'shader-lite'
export const demoteTier = (t: RenderTier): RenderTier =>
  TIER_ORDER[Math.min(tierIndex(t) + 1, TIER_ORDER.length - 1)]

/**
 * GPUs that expose WebGL2 and compile fine but fall over on multi-octave fbm
 * at full-viewport resolution. Used strictly as a *downgrade* signal, never an
 * upgrade one, and only alongside the live benchmark — a renderer string on its
 * own is exactly the kind of check that rots.
 */
const SLOW_GPU =
  /mali-(4|t6|t7|t8)|mali-g(3[0-9]|5[01])\b|adreno\D*(2\d\d|3\d\d|4\d\d|5[0-3]\d)\b|powervr (sgx|ge8)|videocore|swiftshader|software|basic render|llvmpipe|apple a[789]\b/i

export interface Capability {
  tier: RenderTier
  /** Why this tier was chosen. Ship it to analytics. */
  reason: string
  gpu: string | null
  /** Estimated GPU ms for ONE full-canvas frame at the requested pixel count. */
  frameCostMs: number | null
  probedAt: number
}

const PROBE_VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const PROBE_SIZE = 512
/** The whole 60fps budget is 16.6ms. The shader may have ~6 of it. */
const HIGH_BUDGET_MS = 6
/** Above this, even the lite tier is a slideshow. */
const SHADER_CEILING_MS = 14

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2
    ? s[(s.length - 1) / 2]
    : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}

interface NavigatorHints extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

/**
 * Answers "can *this* device run the shader comparator", by compiling the
 * heaviest real shader and timing it at the real pixel budget. Screen width,
 * user-agent strings and GPU-tier databases are deliberately not signals:
 * plenty of small phones handle this fine and plenty of large budget tablets
 * don't, and UA lists are stale the week you ship them.
 *
 * Synchronous and blocking (~10-20ms). Call it from an idle callback, never
 * during hydration.
 *
 * @param fragmentSource The most expensive shader you actually render,
 *   already including its quality prelude and `COMMON`.
 * @param targetPixels Real drawing-buffer area you intend to render, i.e.
 *   `cssWidth * dpr * cssHeight * dpr`.
 */
export function probeCapability(
  fragmentSource: string,
  targetPixels: number,
): Capability {
  const stamp = Date.now()
  const bail = (tier: RenderTier, reason: string): Capability => ({
    tier,
    reason,
    gpu: null,
    frameCostMs: null,
    probedAt: stamp,
  })

  if (typeof document === 'undefined') return bail('css-rich', 'no-dom')

  const nav = navigator as NavigatorHints

  // --- Layer 1: free signals, no GPU work -----------------------------------
  if (nav.connection?.saveData) return bail('css-static', 'save-data')
  if (/(^|-)2g$/.test(nav.connection?.effectiveType ?? ''))
    return bail('css-static', 'slow-net')
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2)
    return bail('css-rich', `deviceMemory=${nav.deviceMemory}`)

  // --- Layer 2: does a real context exist and do the real shaders compile? ---
  const canvas = document.createElement('canvas')
  canvas.width = PROBE_SIZE
  canvas.height = PROBE_SIZE

  let gl: WebGL2RenderingContext | null = null
  try {
    gl =
      // `failIfMajorPerformanceCaveat` rejects software rasterizers outright:
      // they compile everything and render at 3fps, which is the single worst
      // outcome for the visitor.
      (canvas.getContext('webgl2', {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true,
      }) as WebGL2RenderingContext | null) ?? null
  } catch {
    gl = null
  }
  // three.js r163+ is WebGL2-only, so a WebGL1 context is not a fallback here.
  if (!gl) return bail('css-rich', 'no-webgl2')

  const context = gl
  const dbg = context.getExtension('WEBGL_debug_renderer_info')
  const gpu = dbg
    ? String(context.getParameter(dbg.UNMASKED_RENDERER_WEBGL) ?? '') || null
    : null

  const release = () =>
    context.getExtension('WEBGL_lose_context')?.loseContext()
  const fail = (reason: string, tier: RenderTier = 'css-rich'): Capability => {
    release()
    return { tier, reason, gpu, frameCostMs: null, probedAt: stamp }
  }

  // Without true fragment highp, every hash/fbm in these shaders bands into
  // visible mud. That "works but looks broken" case is most of what people
  // report as "my phone doesn't support it".
  const hp = context.getShaderPrecisionFormat(
    context.FRAGMENT_SHADER,
    context.HIGH_FLOAT,
  )
  if (!hp || hp.precision < 23) return fail('no-fragment-highp')
  if (context.getParameter(context.MAX_TEXTURE_SIZE) < 4096)
    return fail('max-texture<4096')
  if (context.getParameter(context.MAX_FRAGMENT_UNIFORM_VECTORS) < 64)
    return fail('few-fragment-uniforms')
  if (context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS) < 4)
    return fail('few-texture-units')

  const program = buildProgram(
    context,
    PROBE_VERT,
    `precision highp float;\n${fragmentSource}`,
  )
  // The check the old `useWebglSupported` was reaching for: not "does a
  // trivial vertex shader compile", but "does *my* fragment shader compile".
  if (!program) return fail('shader-compile-failed')

  // --- Layer 3: how fast does it actually run? ------------------------------
  let frameCostMs: number
  try {
    const buffer = context.createBuffer()
    context.bindBuffer(context.ARRAY_BUFFER, buffer)
    // One oversized triangle covers the viewport with no index buffer.
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      context.STATIC_DRAW,
    )
    const loc = context.getAttribLocation(program, 'aPos')
    context.enableVertexAttribArray(loc)
    context.vertexAttribPointer(loc, 2, context.FLOAT, false, 0, 0)
    context.useProgram(program)

    // Real texture fetches with real mipmaps — sampling a never-uploaded
    // texture is far cheaper than the real thing and would flatter the device.
    const tex = noiseTexture(context)
    context.activeTexture(context.TEXTURE0)
    context.bindTexture(context.TEXTURE_2D, tex)
    for (const name of ['uBefore', 'uAfter']) {
      const u = context.getUniformLocation(program, name)
      if (u) context.uniform1i(u, 0)
    }
    const setF = (name: string, value: number) => {
      const u = context.getUniformLocation(program, name)
      if (u) context.uniform1f(u, value)
    }
    setF('uRealBefore', 1)
    setF('uImgAspect', 0.8)
    setF('uPlaneAspect', 0.8)
    // Mid-transition: both branches of every studies' reveal are live, so no
    // early-out flatters the measurement.
    setF('uProgress', 0.5)
    setF('uTime', 1.2)
    setF('uSeed', 4.4)
    setF('uCenterY', 0.55)

    const pixel = new Uint8Array(4)
    const samples: number[] = []
    for (let i = 0; i < 9; i++) {
      const t0 = performance.now()
      context.drawArrays(context.TRIANGLES, 0, 3)
      // readPixels forces a real flush + sync, otherwise we'd be timing how
      // fast the driver queues commands, which is always ~0.05ms.
      context.readPixels(0, 0, 1, 1, context.RGBA, context.UNSIGNED_BYTE, pixel)
      if (i > 0) samples.push(performance.now() - t0) // drop the compile/upload spike
    }

    const probeMs = median(samples)
    const scale =
      targetPixels > 0 ? targetPixels / (PROBE_SIZE * PROBE_SIZE) : 1
    frameCostMs = probeMs * scale
    context.deleteTexture(tex)
    context.deleteBuffer(buffer)
  } catch (error) {
    return fail(`probe-threw:${(error as Error)?.name ?? 'unknown'}`)
  }

  release()

  const weakCpu =
    typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4
  const slowGpu = Boolean(gpu && SLOW_GPU.test(gpu))
  const notes = [
    `${frameCostMs.toFixed(1)}ms/frame`,
    slowGpu ? 'slow-gpu' : null,
    weakCpu ? `cores=${nav.hardwareConcurrency}` : null,
  ]
    .filter(Boolean)
    .join(' ')

  let tier: RenderTier
  if (frameCostMs > SHADER_CEILING_MS) tier = 'css-rich'
  else if (frameCostMs > HIGH_BUDGET_MS || slowGpu || weakCpu)
    tier = 'shader-lite'
  else tier = 'shader-high'

  // The lite tier renders at dpr 1 with 2-octave noise: roughly a quarter of
  // the fragment work. If even that won't fit the budget, don't pretend.
  if (tier === 'shader-lite' && frameCostMs / 4 > SHADER_CEILING_MS)
    tier = 'css-rich'

  return { tier, reason: notes, gpu, frameCostMs, probedAt: stamp }
}

function buildProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[comparator] shader probe failed:',
          gl.getShaderInfoLog(shader),
        )
      }
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  const vs = compile(gl.VERTEX_SHADER, vertexSource)
  const fs = compile(gl.FRAGMENT_SHADER, fragmentSource)
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs)
    if (fs) gl.deleteShader(fs)
    return null
  }

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[comparator] probe link failed:',
        gl.getProgramInfoLog(program),
      )
    }
    gl.deleteProgram(program)
    return null
  }
  return program
}

function noiseTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const n = 128
  const data = new Uint8Array(n * n * 4)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 256) | 0
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    n,
    n,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data,
  )
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  )
  gl.generateMipmap(gl.TEXTURE_2D)
  return tex
}

export { clamp01 }
