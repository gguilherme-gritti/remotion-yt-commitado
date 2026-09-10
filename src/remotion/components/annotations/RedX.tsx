import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MARKER_SPRING } from '../motion';

const MARKER_RED = '#E63946';
const PATH_LENGTH = 1;
const FIRST_STROKE_FRAMES = 8;
const SECOND_STROKE_DELAY = 6;
const SECOND_STROKE_FRAMES = 8;

/** Traços irregulares, como canetinha à mão — não são retas. */
const STROKE_A = 'M 12 16 C 28 22, 42 44, 54 58 C 66 74, 78 86, 90 88';
const STROKE_B = 'M 88 12 C 74 26, 60 42, 48 56 C 34 72, 22 84, 12 90';

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
    stroke: MARKER_RED,
    strokeWidth: 12,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: PATH_LENGTH,
    strokeDasharray: PATH_LENGTH,
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
        transform: 'rotate(-5deg)',
        pointerEvents: 'none',
      }}
    >
      <path
        d={STROKE_A}
        {...strokeStyle}
        strokeDashoffset={PATH_LENGTH * (1 - firstProgress)}
        opacity={firstProgress > 0.04 ? 1 : 0}
      />
      <path
        d={STROKE_B}
        {...strokeStyle}
        strokeDashoffset={PATH_LENGTH * (1 - secondProgress)}
        opacity={secondProgress > 0.04 ? 1 : 0}
      />
    </svg>
  );
};
