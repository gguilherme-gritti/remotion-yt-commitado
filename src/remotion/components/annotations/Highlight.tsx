import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MARKER_SPRING } from '../motion';

export const HIGHLIGHT_DEFAULT_COLOR = '#FFD000';
const DRAW_FRAMES = 12;

/** Faixa ondulada, como um pincel de marca-texto puxado à mão. */
const HIGHLIGHT_PATH =
  'M 8 20 C 42 14, 78 26, 112 17 S 162 25, 192 20';

function strokeProgress(progress: number): number {
  return interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

interface HighlightProps {
  color?: string;
}

export const Highlight = ({
  color = HIGHLIGHT_DEFAULT_COLOR,
}: HighlightProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({
    frame,
    fps,
    durationInFrames: DRAW_FRAMES,
    config: MARKER_SPRING,
  });

  const progress = strokeProgress(reveal);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `scaleX(${progress})`,
        transformOrigin: 'left center',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <svg
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        aria-hidden
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'visible',
          mixBlendMode: 'multiply',
          opacity: 0.75,
          transform: 'rotate(-0.5deg)',
          pointerEvents: 'none',
        }}
      >
        <path
          d={HIGHLIGHT_PATH}
          fill="none"
          stroke={color}
          strokeWidth={32}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
