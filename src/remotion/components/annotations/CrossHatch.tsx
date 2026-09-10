import { interpolate, useCurrentFrame } from 'remotion';

const INK = '#1a1a1a';
const DEFAULT_OPACITY = 0.65;
const VIEW_SIZE = 480;
const LINE_GAP = 7;
const PATH_LENGTH = 1;
const STROKE_FRAMES = 4;
const TOTAL_FRAMES = 14;

function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function buildHatchStrokes(): { d: string; width: number }[] {
  const strokes: { d: string; width: number }[] = [];
  let index = 0;

  for (let x = -VIEW_SIZE; x <= VIEW_SIZE * 2; x += LINE_GAP) {
    const jx = (hash01(index) - 0.5) * 2.4;
    const jy = (hash01(index + 19) - 0.5) * 3.2;
    const jx2 = (hash01(index + 41) - 0.5) * 2.6;
    const jy2 = (hash01(index + 73) - 0.5) * 2.8;
    const cx = (hash01(index + 5) - 0.5) * 6;
    const cy = (hash01(index + 11) - 0.5) * 6;
    const x1 = x + jx;
    const y1 = jy;
    const x2 = x + VIEW_SIZE + jx2;
    const y2 = VIEW_SIZE + jy2;
    const mx = (x1 + x2) / 2 + cx;
    const my = (y1 + y2) / 2 + cy;

    strokes.push({
      d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      width: 1 + hash01(index + 3) * 0.5,
    });
    index += 1;
  }

  return strokes;
}

const HATCH_STROKES = buildHatchStrokes();

const FADE_MASK =
  'linear-gradient(to bottom, black 0%, transparent 100%)';

function staggerDelay(count: number): number {
  if (count <= 1) {
    return 0;
  }

  return (TOTAL_FRAMES - STROKE_FRAMES) / (count - 1);
}

interface CrossHatchProps {
  opacity?: number;
}

export const CrossHatch = ({ opacity = DEFAULT_OPACITY }: CrossHatchProps) => {
  const frame = useCurrentFrame();
  const lineDelay = staggerDelay(HATCH_STROKES.length);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
        opacity,
        WebkitMaskImage: FADE_MASK,
        maskImage: FADE_MASK,
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        preserveAspectRatio="none"
        aria-hidden
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {HATCH_STROKES.map((stroke, index) => {
          const startAt = index * lineDelay;
          const dashOffset = interpolate(
            frame,
            [startAt, startAt + STROKE_FRAMES],
            [PATH_LENGTH, 0],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            },
          );
          const started = frame >= startAt;

          return (
            <path
              key={stroke.d}
              d={stroke.d}
              fill="none"
              stroke={INK}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={PATH_LENGTH}
              strokeDasharray={PATH_LENGTH}
              strokeDashoffset={dashOffset}
              opacity={started ? 1 : 0}
            />
          );
        })}
      </svg>
    </div>
  );
};
