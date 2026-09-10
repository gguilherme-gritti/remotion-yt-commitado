import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MARKER_SPRING } from '../motion';

const MARKER_GREEN = '#38B000';
const PATH_LENGTH = 1;
const DRAW_FRAMES = 14;

/**
 * Visto à mão: perna esquerda curta, perna direita longa e levemente curvada.
 * Um único traço contínuo, como canetinha na lousa.
 */
const CHECK_PATH =
  'M 14 52 C 22 62, 30 74, 38 82 C 48 64, 66 36, 90 14';

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
        transform: 'rotate(-4deg)',
        pointerEvents: 'none',
      }}
    >
      <path
        d={CHECK_PATH}
        fill="none"
        stroke={MARKER_GREEN}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={PATH_LENGTH}
        strokeDasharray={PATH_LENGTH}
        strokeDashoffset={PATH_LENGTH * (1 - progress)}
        opacity={progress > 0.04 ? 1 : 0}
      />
    </svg>
  );
};
