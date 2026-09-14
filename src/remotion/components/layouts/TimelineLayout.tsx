import type { FC } from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { POP_SPRING } from '../motion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  TIMELINE_ACTIVE_SCALE,
  TIMELINE_AXIS_Y,
  TIMELINE_CANVAS_HEIGHT,
  TIMELINE_CANVAS_WIDTH,
  TIMELINE_DIM_OPACITY,
  TIMELINE_FONT_SIZE,
  TIMELINE_IMAGE_SCALE,
  TIMELINE_INK,
  TIMELINE_NODE_RADIUS,
  TIMELINE_STAGE_STYLE,
  TIMELINE_STROKE_WIDTH,
  TIMELINE_TITLE_STYLE,
  getActiveTimelineStep,
  getTimelineLayoutParts,
  getTimelineLineProgress,
  getTimelineNodeStyle,
  getTimelinePanX,
  getTimelinePath,
  isTimelineImage,
  isTimelineText,
  type TimelineStep,
} from './timelineDefaults';

const ROUGHNESS_FILTER_ID = 'ink-roughness-timeline';
const BOIL_HOLD_FRAMES = 3;
const PATH_LENGTH = 1;

const TimelineInk: FC<{
  steps: TimelineStep[];
  progress: number;
  activeStep: number;
}> = ({ steps, progress, activeStep }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(Math.max(0, frame) / BOIL_HOLD_FRAMES);
  const path = getTimelinePath(steps);
  const axisY = TIMELINE_AXIS_Y * TIMELINE_CANVAS_HEIGHT;

  return (
    <svg
      aria-hidden
      className="ink-roughness"
      viewBox={`0 0 ${TIMELINE_CANVAS_WIDTH} ${TIMELINE_CANVAS_HEIGHT}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        mixBlendMode: 'multiply',
        zIndex: 8,
      }}
    >
      <defs>
        <filter
          id={ROUGHNESS_FILTER_ID}
          colorInterpolationFilters="sRGB"
          x="-8%"
          y="-20%"
          width="116%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.07"
            numOctaves="2"
            result="noise"
            seed={seed}
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
        fill="none"
        stroke={TIMELINE_INK}
        strokeWidth={TIMELINE_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={path}
          pathLength={PATH_LENGTH}
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={PATH_LENGTH * (1 - progress)}
        />
        {steps.map((step) => {
          const reached = progress >= step.index / Math.max(1, steps.length - 1) - 0.02;
          const active = step.index === activeStep;

          return (
            <circle
              key={`timeline-dot-${step.index}`}
              cx={step.x * TIMELINE_CANVAS_WIDTH}
              cy={axisY}
              r={active ? TIMELINE_NODE_RADIUS + 2 : TIMELINE_NODE_RADIUS}
              fill={TIMELINE_INK}
              opacity={reached ? (active ? 1 : TIMELINE_DIM_OPACITY) : 0}
            />
          );
        })}
      </g>
    </svg>
  );
};

const TimelineNode: FC<{
  videoId: string;
  sceneId: string;
  step: TimelineStep;
  active: boolean;
  nextStartAtFrame: number;
}> = ({ videoId, sceneId, step, active, nextStartAtFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: Math.max(0, frame - step.startAtFrame),
    fps,
    durationInFrames: 16,
    config: POP_SPRING,
  });
  const scale = active
    ? interpolate(pop, [0, 1], [1, TIMELINE_ACTIVE_SCALE], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const appear = interpolate(
    frame,
    [step.startAtFrame, step.startAtFrame + 8],
    [TIMELINE_DIM_OPACITY, 1],
    {
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const fadePast = Number.isFinite(nextStartAtFrame)
    ? interpolate(
        frame,
        [nextStartAtFrame, nextStartAtFrame + 10],
        [1, TIMELINE_DIM_OPACITY],
        {
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        },
      )
    : 1;
  const opacity =
    frame < step.startAtFrame
      ? TIMELINE_DIM_OPACITY
      : Number.isFinite(nextStartAtFrame) && frame >= nextStartAtFrame
        ? fadePast
        : appear;

  const images = step.elements.filter(isTimelineImage);
  const texts = step.elements.filter(isTimelineText);

  return (
    <div
      style={{
        ...getTimelineNodeStyle(step.x),
        opacity,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: 'center center',
        color: TIMELINE_INK,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {images.map((element, index) => (
          <TimedElement
            key={`${sceneId}-step-${step.index}-img-${index}`}
            sceneId={sceneId}
            index={step.index * 20 + index}
            videoId={videoId}
            element={element}
            inline
            size="small"
            scale={TIMELINE_IMAGE_SCALE}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {texts.map((element, index) => (
          <TimedElement
            key={`${sceneId}-step-${step.index}-text-${index}`}
            sceneId={sceneId}
            index={step.index * 20 + 10 + index}
            videoId={videoId}
            element={element}
            inline
            fontSize={TIMELINE_FONT_SIZE}
            textAlign="center"
            color={TIMELINE_INK}
            strokeColor={TIMELINE_INK}
          />
        ))}
      </div>
    </div>
  );
};

export const TimelineLayout: FC<BoardLayoutProps> = ({
  videoId,
  scene,
  activeStep: activeFromProps,
}) => {
  const frame = useCurrentFrame();
  const { title, character, steps } = getTimelineLayoutParts(scene);
  const activeStep = activeFromProps ?? getActiveTimelineStep(frame, steps);
  const panX = getTimelinePanX(frame, steps);
  const lineProgress = getTimelineLineProgress(frame, steps);

  return (
    <AbsoluteFill>
      {title ? (
        <div style={TIMELINE_TITLE_STYLE}>
          <TimedElement
            sceneId={scene.id}
            index={0}
            videoId={videoId}
            element={title}
            inline
            textAlign="center"
            fontSize={48}
          />
        </div>
      ) : null}

      <TimedElement
        sceneId={scene.id}
        index={100}
        videoId={videoId}
        element={character}
        characterPosition="bottom_left"
      />

      <div
        style={{
          ...TIMELINE_STAGE_STYLE,
          transform: `translateX(${panX}px)`,
        }}
      >
        <TimelineInk
          steps={steps}
          progress={lineProgress}
          activeStep={activeStep}
        />
        {steps.map((step, index) => (
          <TimelineNode
            key={`${scene.id}-node-${step.index}`}
            videoId={videoId}
            sceneId={scene.id}
            step={step}
            active={step.index === activeStep}
            nextStartAtFrame={
              steps[index + 1]?.startAtFrame ?? Number.POSITIVE_INFINITY
            }
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
