import type { ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';

export const LINE_BOIL_FILTER_ID = 'line-boil';
export const LINE_BOIL_FILTER_URL = `url(#${LINE_BOIL_FILTER_ID})`;

const HOLD_FRAMES = 2;
const DISPLACE_SCALE = 3;

/** SVG invisível: o seed do ruído muda a cada 2 frames (~12 fps numa timeline de 30). */
export const LineBoilFilter = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(Math.max(0, frame) / HOLD_FRAMES);

  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <filter id={LINE_BOIL_FILTER_ID} colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.02"
          numOctaves="1"
          result="noise"
          seed={seed}
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={DISPLACE_SCALE}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
};

interface LineBoilProps {
  enabled?: boolean;
  fill?: boolean;
  children: ReactNode;
}

export const LineBoil = ({
  enabled = true,
  fill = false,
  children,
}: LineBoilProps) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: fill ? 'flex' : 'inline-block',
        width: fill ? '100%' : undefined,
        height: fill ? '100%' : undefined,
        filter: LINE_BOIL_FILTER_URL,
        overflow: 'visible',
      }}
    >
      {children}
    </div>
  );
};
