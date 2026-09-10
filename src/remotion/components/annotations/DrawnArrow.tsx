import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { AnnotationDirection } from '../../../types/scene';
import { MARKER_SPRING } from '../motion';

export const DRAWN_ARROW_MAX_WIDTH = 180;
export const DRAWN_ARROW_MAX_HEIGHT = 100;
export const DRAWN_ARROW_WIDTH = 100;
export const DRAWN_ARROW_HEIGHT = 56;
export const DRAWN_ARROW_GAP_PX = 0;
/** Recuo sobre a caixa de origem, para o traço ocupar o vão e não o destino. */
export const DRAWN_ARROW_ORIGIN_INSET = '86%';

const DEFAULT_COLOR = '#000000';
const MARKER_RED = '#D62828';
const PATH_LENGTH = 1;
const BODY_FRAMES = 10;
const HEAD_DELAY = 8;
const HEAD_FRAMES = 6;

/** viewBox 180×100 — o corpo e a ponta cabem na caixa do conector. */
const BODY_PATH = 'M 8 52 C 48 34, 90 70, 138 50';
const HEAD_PATH = 'M 124 32 C 142 42, 156 46, 170 50 C 156 54, 142 64, 124 72';

const CURVE_BODY_PATH = 'M 12 16 C 8 58, 70 90, 138 62';
const CURVE_HEAD_PATH = 'M 112 50 C 134 56, 152 60, 168 62 C 152 70, 134 82, 116 90';

const DIRECTION_TRANSFORM: Record<AnnotationDirection, string | undefined> = {
  right: undefined,
  curve_right: undefined,
  left: 'translate(180 0) scale(-1 1)',
  up: 'rotate(-90 90 50)',
  down: 'rotate(90 90 50)',
};

function strokeProgress(progress: number): number {
  return interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

interface DrawnArrowProps {
  color?: string;
  direction?: AnnotationDirection;
}

export const DrawnArrow = ({
  color = DEFAULT_COLOR,
  direction = 'right',
}: DrawnArrowProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bodyDraw = spring({
    frame,
    fps,
    durationInFrames: BODY_FRAMES,
    config: MARKER_SPRING,
  });

  const headDraw = spring({
    frame,
    fps,
    delay: HEAD_DELAY,
    durationInFrames: HEAD_FRAMES,
    config: MARKER_SPRING,
  });

  const bodyProgress = strokeProgress(bodyDraw);
  const headProgress = strokeProgress(headDraw);
  const curved = direction === 'curve_right';

  const strokeStyle = {
    fill: 'none' as const,
    stroke: color === '#E63946' ? MARKER_RED : color,
    strokeWidth: 5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: PATH_LENGTH,
    strokeDasharray: PATH_LENGTH,
  };

  return (
    <svg
      viewBox="0 0 180 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        maxWidth: DRAWN_ARROW_MAX_WIDTH,
        maxHeight: DRAWN_ARROW_MAX_HEIGHT,
        overflow: 'visible',
        mixBlendMode: 'multiply',
        transform: 'rotate(-3deg)',
        pointerEvents: 'none',
      }}
    >
      <g transform={DIRECTION_TRANSFORM[direction]}>
        <path
          d={curved ? CURVE_BODY_PATH : BODY_PATH}
          {...strokeStyle}
          strokeDashoffset={PATH_LENGTH * (1 - bodyProgress)}
          opacity={bodyProgress > 0.04 ? 1 : 0}
        />
        <path
          d={curved ? CURVE_HEAD_PATH : HEAD_PATH}
          {...strokeStyle}
          strokeDashoffset={PATH_LENGTH * (1 - headProgress)}
          opacity={headProgress > 0.04 ? 1 : 0}
        />
      </g>
    </svg>
  );
};
