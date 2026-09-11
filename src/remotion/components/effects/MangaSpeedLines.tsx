import type { FC } from 'react';
import {
  AbsoluteFill,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { MARKER_SPRING } from '../motion';

const LINE_COUNT = 90;
const OUTER_RADIUS = 1200;
const INNER_RADIUS_MIN = 200;
const INNER_RADIUS_MAX = 450;
const STROKE_MIN = 1;
const STROKE_MAX = 6;
const HOLD_FRAMES = 2;
const ENTRANCE_FRAMES = 7;
const DEFAULT_COLOR = '#111111';
const ROUGHNESS_FILTER_ID = 'ink-roughness';
const CANVAS = OUTER_RADIUS * 2;
const CENTER = OUTER_RADIUS;

export interface MangaSpeedLinesProps {
  color?: string;
}

const between = (seed: number | string, min: number, max: number): number => {
  return min + random(seed) * (max - min);
};

export const MangaSpeedLines: FC<MangaSpeedLinesProps> = ({
  color = DEFAULT_COLOR,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frameStep = Math.floor(frame / HOLD_FRAMES);
  const slot = (Math.PI * 2) / LINE_COUNT;

  const entrance = spring({
    frame,
    fps,
    durationInFrames: ENTRANCE_FRAMES,
    config: MARKER_SPRING,
  });

  const lines = Array.from({ length: LINE_COUNT }, (_, index) => {
    const angle =
      index * slot + (random(`${frameStep}-ang-${index}`) - 0.5) * slot * 1.35;
    const innerRadius = between(
      `${frameStep}-inner-${index}`,
      INNER_RADIUS_MIN,
      INNER_RADIUS_MAX,
    );
    const strokeWidth = between(
      `${frameStep}-stroke-${index}`,
      STROKE_MIN,
      STROKE_MAX,
    );

    return {
      x1: CENTER + Math.cos(angle) * innerRadius,
      y1: CENTER + Math.sin(angle) * innerRadius,
      x2: CENTER + Math.cos(angle) * OUTER_RADIUS,
      y2: CENTER + Math.sin(angle) * OUTER_RADIUS,
      strokeWidth,
    };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <svg
        aria-hidden
        className="ink-roughness"
        width={CANVAS}
        height={CANVAS}
        viewBox={`0 0 ${CANVAS} ${CANVAS}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${entrance})`,
          transformOrigin: 'center center',
          mixBlendMode: 'multiply',
          opacity: entrance,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter
            id={ROUGHNESS_FILTER_ID}
            colorInterpolationFilters="sRGB"
            x="-12%"
            y="-12%"
            width="124%"
            height="124%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.07"
              numOctaves="2"
              result="noise"
              seed={frameStep}
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <g
          className="ink-roughness"
          filter={`url(#${ROUGHNESS_FILTER_ID})`}
          stroke={color}
          strokeLinecap="butt"
        >
          {lines.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              strokeWidth={line.strokeWidth}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
