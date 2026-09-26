// The reference's Lottie block is a custom element, not an <img> or a canvas:
//
//   <lottie-player background="transparent" style="width:100%;height:100%">
//
// It is registered at runtime by public/v24/vendor/lottie-player.js, which the
// route loads lazily from lib/motion.ts. TypeScript has no intrinsic element
// called `lottie-player`, so this declares it.
//
// Scoped to this route's directory on purpose: the declaration is only reachable
// from app/v24, so it cannot widen the element set for any other route.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type LottiePlayerProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  /** path to the Lottie JSON, e.g. /v24/vendor/data.json */
  src?: string;
  background?: string;
  speed?: string | number;
  mode?: string;
  loop?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  renderer?: 'svg' | 'canvas' | 'html';
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': LottiePlayerProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': LottiePlayerProps;
    }
  }
}

export {};
