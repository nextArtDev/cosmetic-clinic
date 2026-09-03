import type { RenderTier } from './render-capability'

/**
 * Prepended to every fragment shader. `FBM_OCTAVES` halves noise cost on the
 * lite tier (fbm is called up to 4× per fragment in some studies, so this is
 * the single biggest lever), and `AMBIENT` compiles out the per-frame
 * `hash21(… uTime …)` sparkle blocks and high-frequency scanlines, which are
 * pure decoration but cost real fill rate and alias badly at dpr 1.
 *
 * `HIGH_OCTAVES` normalization keeps both tiers in the same output range, so
 * every `smoothstep` threshold tuned against the 4-octave version still lands
 * in the same place. The high tier resolves to ×1.0 — byte-identical output.
 */
export const QUALITY_HIGH = '#define FBM_OCTAVES 4\n#define AMBIENT 1\n'
export const QUALITY_LITE = '#define FBM_OCTAVES 2\n#define AMBIENT 0\n'

export function qualityPrelude(tier: RenderTier): string {
  return tier === 'shader-high' ? QUALITY_HIGH : QUALITY_LITE
}
