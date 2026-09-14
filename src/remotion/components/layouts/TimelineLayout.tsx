import type { FC } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  TIMELINE_ACTIVE_SCALE,
  TIMELINE_AXIS_Y,
  TIMELINE_CANVAS_HEIGHT,
  TIMELINE_CANVAS_WIDTH,
  TIMELINE_FONT_SIZE,
  TIMELINE_IMAGE_SCALE,
  TIMELINE_INK,
  TIMELINE_NODE_RADIUS,
  TIMELINE_STAGE_STYLE,
  TIMELINE_STROKE_WIDTH,
  TIMELINE_TITLE_STYLE,
  getTimelineLayoutParts,
  getTimelineNodeFocus,
  getTimelineNodeStyle,
  getTimelinePanX,
  getTimelineSegmentDraw,
  getTimelineSegmentPath,
  isTimelineImage,
  isTimelineText,
  type TimelineStep,
} from './timelineDefaults';

const ROUGHNESS_FILTER_ID = 'ink-roughness-timeline';
const BOIL_HOLD_FRAMES = 3;

function getDotOpacity(
  frame: number,
  step: TimelineStep,
  nextStep: TimelineStep | undefined,
): number {
  const { opacity: live } = getTimelineNodeFocus(frame, step, nextStep);
  if (step.index === 0) {
    return live;
  }

  const arrive = interpolate(
    getTimelineSegmentDraw(frame, step),
    [0.5, 1],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return frame < step.startAtFrame ? arrive : live;
}

const TimelineInk: FC<{
  steps: TimelineStep[];
}> = ({ steps }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(Math.max(0, frame) / BOIL_HOLD_FRAMES);
  const axisY = TIMELINE_AXIS_Y * TIMELINE_CANVAS_HEIGHT;
  const growRange = TIMELINE_ACTIVE_SCALE - 1;

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
        {steps.slice(1).map((step, index) => {
          const draw = getTimelineSegmentDraw(frame, step);
          const cap = interpolate(draw, [0, 0.06], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <path
              key={`timeline-seg-${step.index}`}
              d={getTimelineSegmentPath(steps[index], step)}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
              opacity={cap}
            />
          );
        })}
        {steps.map((step) => {
          const focus = getTimelineNodeFocus(frame, step, steps[step.index + 1]);
          const grow = growRange > 0 ? (focus.scale - 1) / growRange : 0;

          return (
            <circle
              key={`timeline-dot-${step.index}`}
              cx={step.x * TIMELINE_CANVAS_WIDTH}
              cy={axisY}
              r={TIMELINE_NODE_RADIUS + 2 * Math.max(0, grow)}
              fill={TIMELINE_INK}
              opacity={getDotOpacity(frame, step, steps[step.index + 1])}
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
  nextStep?: TimelineStep;
}> = ({ videoId, sceneId, step, nextStep }) => {
  const frame = useCurrentFrame();
  const { opacity, scale } = getTimelineNodeFocus(frame, step, nextStep);
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

export const TimelineLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const frame = useCurrentFrame();
  const { title, character, steps } = getTimelineLayoutParts(scene);
  const panX = getTimelinePanX(frame, steps);

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
        <TimelineInk steps={steps} />
        {steps.map((step, index) => (
          <TimelineNode
            key={`${scene.id}-node-${step.index}`}
            videoId={videoId}
            sceneId={scene.id}
            step={step}
            nextStep={steps[index + 1]}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
