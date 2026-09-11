import type { CSSProperties, FC } from 'react';
import { useMemo } from 'react';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill, Easing, interpolate, useVideoConfig } from 'remotion';

/** Tempo suficiente para cada passada diagonal ser lida como um gesto separado. */
export const ERASE_PRESENTATION_FRAMES = 42;
export const ERASER_FRAMES = ERASE_PRESENTATION_FRAMES;

const STROKE_COUNT = 6;
/** Atraso relativo entre o início de cada faixa (de cima para baixo). */
const STAGGER = 0.13;
/** Fração da transição que cada passada leva para atravessar o quadro. */
const STROKE_WINDOW = 0.35;
const WIPE_ANGLE_DEG = -40;
const BAND_SPAN_RATIO = 0.3;
const FRONT_SAMPLES = 18;
const DEFAULT_DUST_WIDTH_PX = 22;
const U_PAD = 90;
const V_PAD = 50;
const U_NUDGE = [0, 42, -28, 58, -18, 36] as const;
const V_NUDGE = [0, 22, -16, 28, -10, 18] as const;

export type ErasePresentationProps = {
  /** Largura da linha de pó na ponta de cada passada, em px. Default: 22. */
  eraserWidthPx?: number;
};

type StrokeGeometry = {
  path: string;
  dustPath: string | null;
  progress: number;
};

const strokeProgress = (progress: number, index: number): number => {
  const start = index * STAGGER;
  const end = start + STROKE_WINDOW;

  return interpolate(progress, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
};

const project = (
  u: number,
  v: number,
  cosA: number,
  sinA: number,
): [number, number] => [u * cosA - v * sinA, u * sinA + v * cosA];

const feltJag = (strokeIndex: number, sample: number): number => {
  const n = Math.sin((strokeIndex + 1) * 12.9898 + sample * 78.233) * 43758.5453;
  return (n - Math.floor(n) - 0.5) * 24;
};

const edgePoints = (
  u: number,
  v0: number,
  v1: number,
  cosA: number,
  sinA: number,
  strokeIndex: number,
  reverse: boolean,
): string[] => {
  const points: string[] = [];
  for (let sample = 0; sample <= FRONT_SAMPLES; sample += 1) {
    const t = reverse ? 1 - sample / FRONT_SAMPLES : sample / FRONT_SAMPLES;
    const v = v0 + (v1 - v0) * t;
    const [x, y] = project(u + feltJag(strokeIndex, t), v, cosA, sinA);
    points.push(`${x},${y}`);
  }
  return points;
};

const buildStrokePath = (
  uStart: number,
  uFront: number,
  v0: number,
  v1: number,
  cosA: number,
  sinA: number,
  strokeIndex: number,
): string => {
  const backStart = project(uStart, v0, cosA, sinA);
  const backEnd = project(uStart, v1, cosA, sinA);
  const front = edgePoints(uFront, v0, v1, cosA, sinA, strokeIndex, false);
  return `M ${backStart[0]},${backStart[1]} L ${front.join(' L ')} L ${backEnd[0]},${backEnd[1]} Z`;
};

const buildDustPath = (
  uFront: number,
  v0: number,
  v1: number,
  thickness: number,
  cosA: number,
  sinA: number,
  strokeIndex: number,
): string => {
  const front = edgePoints(uFront + thickness * 0.35, v0, v1, cosA, sinA, strokeIndex, false);
  const back = edgePoints(uFront - thickness * 0.65, v0, v1, cosA, sinA, strokeIndex + 3, true);
  return `M ${front.join(' L ')} L ${back.join(' L ')} Z`;
};

const buildStrokes = (
  progress: number,
  width: number,
  height: number,
  dustWidthPx: number,
): StrokeGeometry[] => {
  const angle = (WIPE_ANGLE_DEG * Math.PI) / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const corners: Array<[number, number]> = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ];
  const us = corners.map(([x, y]) => x * cosA + y * sinA);
  const vs = corners.map(([x, y]) => -x * sinA + y * cosA);
  const uMin = Math.min(...us) - U_PAD;
  const uMax = Math.max(...us) + U_PAD;
  const vMin = Math.min(...vs) - V_PAD;
  const vMax = Math.max(...vs) + V_PAD;
  const vSpan = vMax - vMin;
  const bandWidth = vSpan * BAND_SPAN_RATIO;

  return Array.from({ length: STROKE_COUNT }, (_, index) => {
    const amount = strokeProgress(progress, index);
    const center = vMin + (index / (STROKE_COUNT - 1)) * vSpan + V_NUDGE[index];
    const v0 = center - bandWidth / 2;
    const v1 = center + bandWidth / 2;
    const uStart = uMin + U_NUDGE[index];
    const uFront = uStart + amount * (uMax - uStart);

    if (amount <= 0) {
      return { path: '', dustPath: null, progress: 0 };
    }

    return {
      progress: amount,
      path: buildStrokePath(uStart, uFront, v0, v1, cosA, sinA, index),
      dustPath:
        amount > 0.04 && amount < 0.97
          ? buildDustPath(uFront, v0, v1, dustWidthPx, cosA, sinA, index)
          : null,
    };
  });
};

const ErasePresentation: FC<
  TransitionPresentationComponentProps<ErasePresentationProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const { width, height } = useVideoConfig();
  const isExiting = presentationDirection === 'exiting';
  const isComplete = presentationProgress >= 1;
  const dustWidthPx = passedProps.eraserWidthPx ?? DEFAULT_DUST_WIDTH_PX;
  const maskId = `eraser-multi-stroke-mask-${presentationDirection}`;
  const roughnessId = `ink-roughness-${presentationDirection}`;

  const strokes = useMemo(
    () => buildStrokes(presentationProgress, width, height, dustWidthPx),
    [dustWidthPx, height, presentationProgress, width],
  );

  const outerStyle: CSSProperties = {
    zIndex: isExiting ? 2 : 1,
  };

  if (isComplete) {
    return (
      <AbsoluteFill style={{ ...outerStyle, opacity: isExiting ? 0 : 1 }}>
        {children}
      </AbsoluteFill>
    );
  }

  const maskFill = isExiting ? '#ffffff' : '#000000';
  const strokeFill = isExiting ? '#000000' : '#ffffff';

  const innerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    clipPath: `url(#${maskId}-clip)`,
    WebkitClipPath: `url(#${maskId}-clip)`,
    maskImage: `url(#${maskId})`,
    WebkitMaskImage: `url(#${maskId})`,
    maskMode: 'luminance',
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  };

  return (
    <AbsoluteFill style={outerStyle}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          <filter
            id={roughnessId}
            colorInterpolationFilters="sRGB"
            x="-18%"
            y="-18%"
            width="136%"
            height="136%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.055"
              numOctaves="3"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={width}
            height={height}
          >
            <rect x={0} y={0} width={width} height={height} fill={maskFill} />
            <g className="ink-roughness" filter={`url(#${roughnessId})`}>
              {strokes.map((stroke, index) =>
                stroke.path ? (
                  <path key={index} d={stroke.path} fill={strokeFill} />
                ) : null,
              )}
            </g>
          </mask>
          <clipPath id={`${maskId}-clip`} clipPathUnits="userSpaceOnUse">
            {isExiting ? (
              <path
                d={`M 0 0 H ${width} V ${height} H 0 Z ${strokes
                  .map((stroke) => stroke.path)
                  .filter(Boolean)
                  .join(' ')}`}
                clipRule="evenodd"
              />
            ) : (
              strokes.map((stroke, index) =>
                stroke.path ? <path key={index} d={stroke.path} /> : null,
              )
            )}
          </clipPath>
        </defs>
        {isExiting
          ? strokes.map((stroke, index) =>
              stroke.dustPath ? (
                <path
                  key={`dust-${index}`}
                  className="ink-roughness"
                  d={stroke.dustPath}
                  fill="#F0F0EC"
                  opacity={0.9}
                  filter={`url(#${roughnessId})`}
                />
              ) : null,
            )
          : null}
      </svg>
      <AbsoluteFill style={innerStyle}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const erasePresentation = (
  props?: ErasePresentationProps,
): TransitionPresentation<ErasePresentationProps> => {
  return {
    component: ErasePresentation,
    props: props ?? {},
  };
};
