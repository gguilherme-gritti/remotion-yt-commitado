import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MARKER_SPRING } from '../motion';

const INK_GREEN = '#2D6A4F';
const INK_OPACITY = 0.88;
const PATH_LENGTH = 1;
const DRAW_FRAMES = 14;
const ROUGHNESS_FILTER_ID = 'ink-roughness-green-check';

/**
 * Visto à mão: perna esquerda curta, perna direita longa.
 * Dois riscos de pena desalinhados, como nanquim sobre a lousa.
 */
const CHECK_PATH = 'M 18 54 C 26 64, 34 74, 42 82 C 52 64, 68 38, 86 18';
const CHECK_PATH_PASS = 'M 19.6 52.6 C 27.4 62.8, 35.2 73.2, 43.4 80.6 C 53.2 63.1, 69.4 36.6, 87.2 16.8';

function strokeProgress(progress: number): number {
  return interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export const GreenCheck = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const draw = spring({
    frame,
    fps,
    durationInFrames: DRAW_FRAMES,
    config: MARKER_SPRING,
  });

  const progress = strokeProgress(draw);

  const strokeStyle = {
    fill: 'none' as const,
    stroke: INK_GREEN,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: PATH_LENGTH,
    strokeDasharray: PATH_LENGTH,
    filter: `url(#${ROUGHNESS_FILTER_ID})`,
    strokeDashoffset: PATH_LENGTH * (1 - progress),
    opacity: progress > 0.04 ? INK_OPACITY : 0,
  };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'visible',
        mixBlendMode: 'multiply',
        transform: 'rotate(-4deg)',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter
          id={ROUGHNESS_FILTER_ID}
          colorInterpolationFilters="sRGB"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08"
            numOctaves="2"
            result="noise"
            seed="7"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <path d={CHECK_PATH} {...strokeStyle} strokeWidth={7} />
      <path d={CHECK_PATH_PASS} {...strokeStyle} strokeWidth={6} />
    </svg>
  );
};
