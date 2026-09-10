import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MARKER_SPRING } from '../motion';

export const ENCIRCLE_DEFAULT_COLOR = '#111111';
const INK_OPACITY = 0.9;
const PATH_LENGTH = 1;
const FIRST_LOOP_FRAMES = 10;
const SECOND_LOOP_DELAY = 6;
const SECOND_LOOP_FRAMES = 10;
const ROUGHNESS_FILTER_ID = 'encircle-ink-roughness';
/** ~6–8px no overlay da lousa (viewBox 100, caixa ~ imagem + 40px). */
const OUTER_STROKE_WIDTH = 2.5;
const INNER_STROKE_WIDTH = 2.3;

/**
 * Volta externa: quase fecha, com um vão pequeno no canto superior direito.
 * Fica na folga do overlay (inset -20px), sem encostar na arte.
 */
const OUTER_LOOP =
  'M 93.2 33.7 C 94.0 37.0, 98.1 47.3, 97.9 53.8 C 97.7 60.3, 95.2 67.2, 91.8 72.8 C 88.5 78.3, 83.5 83.7, 78.0 87.3 C 72.6 91.0, 65.6 93.6, 59.1 94.7 C 52.7 95.9, 45.9 95.4, 39.4 94.1 C 33.0 92.7, 25.9 90.2, 20.4 86.5 C 15.0 82.9, 9.5 77.6, 6.6 71.9 C 3.8 66.2, 3.2 58.7, 3.3 52.1 C 3.3 45.6, 4.5 38.6, 7.0 32.7 C 9.5 26.8, 13.5 21.1, 18.2 16.7 C 22.8 12.4, 28.8 8.7, 35.0 6.6 C 41.1 4.6, 48.7 3.9, 55.3 4.5 C 61.8 5.0, 68.8 6.9, 74.2 10.0 C 79.5 13.1, 85.3 20.8, 87.5 23.0';

/**
 * Volta interna: deslocada e um pouco menor, para as duas linhas
 * finas se sobreporem sem virar um único traço grosso.
 */
const INNER_LOOP =
  'M 93.2 57.8 C 91.9 60.2, 89.0 68.4, 85.5 72.7 C 82.1 76.9, 77.4 80.9, 72.5 83.4 C 67.5 86.0, 61.4 87.5, 55.9 88.0 C 50.4 88.4, 45.0 87.7, 39.5 86.3 C 34.1 84.9, 27.9 82.8, 23.4 79.5 C 18.8 76.3, 14.5 71.8, 12.3 66.8 C 10.1 61.9, 10.1 55.6, 10.3 50.1 C 10.6 44.6, 11.6 38.8, 13.7 33.9 C 15.7 29.0, 19.0 24.3, 22.8 20.6 C 26.6 16.9, 31.5 13.6, 36.6 11.7 C 41.7 9.8, 48.0 9.0, 53.6 9.1 C 59.1 9.3, 65.5 10.5, 70.2 12.6 C 74.9 14.8, 78.4 18.0, 81.8 22.1 C 85.3 26.1, 89.2 34.6, 90.7 37.1';

interface HandDrawnEncircleProps {
  color?: string;
}

export const HandDrawnEncircle = ({
  color = ENCIRCLE_DEFAULT_COLOR,
}: HandDrawnEncircleProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstLoop = spring({
    frame,
    fps,
    durationInFrames: FIRST_LOOP_FRAMES,
    config: MARKER_SPRING,
  });

  const secondLoop = spring({
    frame,
    fps,
    delay: SECOND_LOOP_DELAY,
    durationInFrames: SECOND_LOOP_FRAMES,
    config: MARKER_SPRING,
  });

  const firstProgress = interpolate(firstLoop, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const secondProgress = interpolate(secondLoop, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const strokeStyle = {
    fill: 'none' as const,
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: PATH_LENGTH,
    strokeDasharray: PATH_LENGTH,
    filter: `url(#${ROUGHNESS_FILTER_ID})`,
  };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'visible',
        mixBlendMode: 'multiply',
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
            baseFrequency="0.07"
            numOctaves="2"
            result="noise"
            seed="5"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <path
        d={OUTER_LOOP}
        {...strokeStyle}
        strokeWidth={OUTER_STROKE_WIDTH}
        strokeDashoffset={PATH_LENGTH * (1 - firstProgress)}
        opacity={firstProgress > 0.04 ? INK_OPACITY : 0}
      />
      <path
        d={INNER_LOOP}
        {...strokeStyle}
        strokeWidth={INNER_STROKE_WIDTH}
        strokeDashoffset={PATH_LENGTH * (1 - secondProgress)}
        opacity={secondProgress > 0.04 ? INK_OPACITY : 0}
      />
    </svg>
  );
};
