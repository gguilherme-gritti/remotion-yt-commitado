import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const INK = '#0a0a0a';
const BURST_FRAMES = 10;
const SPLATTER_SPRING = {
  damping: 12,
  stiffness: 220,
  mass: 0.4,
} as const;

/** Foco no canto superior direito — longe do centro da arte. */
const ORIGIN = { x: 54, y: 34 };

const SHARD_A =
  'M 0.9 -3.8 C 2.8 -2.6, 3.6 0.1, 2.0 2.1 C 0.4 3.5, -2.2 2.7, -2.9 0.3 C -3.1 -1.8, -1.2 -3.4, 0.9 -3.8 Z';
const SHARD_B =
  'M -0.6 -4.0 C 1.6 -3.7, 3.3 -1.1, 2.5 1.3 C 1.1 3.0, -1.6 2.8, -3.0 0.8 C -3.5 -1.1, -2.4 -3.3, -0.6 -4.0 Z';
const SHARD_C =
  'M 1.5 -2.7 C 3.1 -1.4, 2.7 1.3, 0.8 2.5 C -1.1 3.1, -2.8 1.2, -2.3 -0.8 C -1.5 -2.3, -0.1 -2.9, 1.5 -2.7 Z';
const DROP_PATH =
  'M 0.3 -4.6 C 1.7 -2.4, 2.3 0.5, 0.5 2.5 C -1.3 2.6, -2.1 0.1, -1.3 -2.2 C -0.7 -3.5, -0.3 -4.2, 0.3 -4.6 Z';

type SplatKind = 'circle' | 'drop' | 'shard';

interface Splat {
  angle: number;
  dist: number;
  size: number;
  kind: SplatKind;
  rot: number;
  shard?: 0 | 1 | 2;
}

/** 14 pingos assimétricos com bastante espaço em branco entre eles. */
const SPLATS: Splat[] = [
  { angle: -26, dist: 14, size: 2.15, kind: 'shard', rot: 16, shard: 0 },
  { angle: 8, dist: 10, size: 1.55, kind: 'drop', rot: -14 },
  { angle: 36, dist: 20, size: 0.72, kind: 'circle', rot: 0 },
  { angle: 62, dist: 8, size: 2.4, kind: 'shard', rot: 38, shard: 1 },
  { angle: 94, dist: 17, size: 0.58, kind: 'circle', rot: 0 },
  { angle: 122, dist: 12, size: 1.45, kind: 'drop', rot: 24 },
  { angle: 152, dist: 21, size: 0.5, kind: 'circle', rot: 0 },
  { angle: 178, dist: 9, size: 1.9, kind: 'shard', rot: -42, shard: 2 },
  { angle: 210, dist: 16, size: 1.2, kind: 'drop', rot: 52 },
  { angle: 238, dist: 6, size: 0.55, kind: 'circle', rot: 0 },
  { angle: 270, dist: 13, size: 1.35, kind: 'drop', rot: -20 },
  { angle: 304, dist: 11, size: 2.05, kind: 'shard', rot: 70, shard: 0 },
  { angle: 334, dist: 19, size: 0.62, kind: 'circle', rot: 0 },
  { angle: 14, dist: 5, size: 0.68, kind: 'circle', rot: 0 },
];

const SHARDS = [SHARD_A, SHARD_B, SHARD_C] as const;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export const InkSplatter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const burst = spring({
    frame,
    fps,
    durationInFrames: BURST_FRAMES,
    config: SPLATTER_SPRING,
  });

  const spray = interpolate(burst, [0, 1], [0.14, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const markScale = interpolate(burst, [0, 1], [0.2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const visible = burst > 0.06 ? 1 : 0;

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
        pointerEvents: 'none',
      }}
    >
      {SPLATS.map((splat) => {
        const rad = toRad(splat.angle);
        const x = ORIGIN.x + Math.cos(rad) * splat.dist * spray;
        const y = ORIGIN.y + Math.sin(rad) * splat.dist * spray;
        const facing = splat.angle + 90 + splat.rot;
        const key = `${splat.kind}-${splat.angle}-${splat.dist}`;

        if (splat.kind === 'circle') {
          return (
            <circle
              key={key}
              cx={x}
              cy={y}
              r={splat.size * 1.15 * markScale}
              fill={INK}
              opacity={visible}
            />
          );
        }

        const d =
          splat.kind === 'drop' ? DROP_PATH : SHARDS[splat.shard ?? 0];

        return (
          <path
            key={key}
            d={d}
            fill={INK}
            transform={`translate(${x} ${y}) rotate(${facing}) scale(${splat.size * markScale})`}
            opacity={visible}
          />
        );
      })}
    </svg>
  );
};
