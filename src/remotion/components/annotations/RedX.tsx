import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MARKER_SPRING } from '../motion';

const INK_RED = '#C1121F';
const INK_OPACITY = 0.88;
const PATH_LENGTH = 1;
const FIRST_STROKE_FRAMES = 8;
const SECOND_STROKE_DELAY = 6;
const SECOND_STROKE_FRAMES = 8;
const ROUGHNESS_FILTER_ID = 'ink-roughness-red-x';

/** Primeira perna: dois riscos de pena ligeiramente desalinhados. */
const STROKE_A = 'M 18 20 C 32 26, 44 46, 54 58 C 64 72, 76 84, 86 86';
const STROKE_A_PASS = 'M 19.6 18.8 C 33.4 25.2, 45.2 44.8, 55.4 56.8 C 65.6 71.1, 77.2 82.6, 87.4 84.8';

/** Segunda perna: o mesmo gesto, 1–2px de offset. */
const STROKE_B = 'M 84 18 C 72 30, 60 44, 50 56 C 38 70, 26 82, 18 86';
const STROKE_B_PASS = 'M 82.4 19.4 C 70.6 31.2, 58.6 45.2, 48.4 57.2 C 36.6 71.4, 24.8 83.2, 16.6 87.4';

function strokeProgress(progress: number): number {
  return interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export const RedX = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstStroke = spring({
    frame,
    fps,
    durationInFrames: FIRST_STROKE_FRAMES,
    config: MARKER_SPRING,
  });

  const secondStroke = spring({
    frame,
    fps,
    delay: SECOND_STROKE_DELAY,
    durationInFrames: SECOND_STROKE_FRAMES,
    config: MARKER_SPRING,
  });

  const firstProgress = strokeProgress(firstStroke);
  const secondProgress = strokeProgress(secondStroke);

  const strokeStyle = {
    fill: 'none' as const,
    stroke: INK_RED,
    strokeWidth: 7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: PATH_LENGTH,
    strokeDasharray: PATH_LENGTH,
    filter: `url(#${ROUGHNESS_FILTER_ID})`,
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
        transform: 'rotate(-5deg)',
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
            seed="4"
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
      <path
        d={STROKE_A}
        {...strokeStyle}
        strokeDashoffset={PATH_LENGTH * (1 - firstProgress)}
        opacity={firstProgress > 0.04 ? INK_OPACITY : 0}
      />
      <path
        d={STROKE_A_PASS}
        {...strokeStyle}
        strokeWidth={6}
        strokeDashoffset={PATH_LENGTH * (1 - firstProgress)}
        opacity={firstProgress > 0.04 ? INK_OPACITY : 0}
      />
      <path
        d={STROKE_B}
        {...strokeStyle}
        strokeDashoffset={PATH_LENGTH * (1 - secondProgress)}
        opacity={secondProgress > 0.04 ? INK_OPACITY : 0}
      />
      <path
        d={STROKE_B_PASS}
        {...strokeStyle}
        strokeWidth={6}
        strokeDashoffset={PATH_LENGTH * (1 - secondProgress)}
        opacity={secondProgress > 0.04 ? INK_OPACITY : 0}
      />
    </svg>
  );
};
