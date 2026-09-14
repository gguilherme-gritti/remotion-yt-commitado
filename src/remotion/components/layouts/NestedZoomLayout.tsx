import type { FC } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { SceneElement } from '../../../types/scene';
import { SOFT_SPRING } from '../motion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  NESTED_ENTRY_FRAMES,
  NESTED_ENTRY_FROM,
  NESTED_FONT_SIZE,
  NESTED_FRAME_WRAP_STYLE,
  NESTED_IMAGE_SCALE,
  NESTED_INK_COLOR,
  NESTED_SCREEN_COVER_STYLE,
  NESTED_SCREEN_ORIGIN,
  NESTED_SCREEN_STYLE,
  NESTED_STAGE_STYLE,
  NESTED_ZOOM,
  NESTED_ZOOM_FRAMES,
  getNestedZoomLayoutParts,
  isNestedCharacter,
  isNestedImage,
  isNestedText,
} from './nestedZoomDefaults';

const ROUGHNESS_FILTER_ID = 'ink-roughness-nested-zoom';
const BOIL_HOLD_FRAMES = 3;

const NestedInkFilter: FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(Math.max(0, frame) / BOIL_HOLD_FRAMES);

  return (
    <svg
      aria-hidden
      className="ink-roughness"
      width="0"
      height="0"
      style={{ position: 'absolute', overflow: 'hidden' }}
    >
      <defs>
        <filter
          id={ROUGHNESS_FILTER_ID}
          colorInterpolationFilters="sRGB"
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
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
    </svg>
  );
};

const NestedItem: FC<{
  videoId: string;
  sceneId: string;
  index: number;
  element: SceneElement;
}> = ({ videoId, sceneId, index, element }) => {
  if (isNestedCharacter(element)) {
    return (
      <TimedElement
        sceneId={sceneId}
        index={index}
        videoId={videoId}
        element={element}
        characterPosition="center"
      />
    );
  }

  return (
    <TimedElement
      sceneId={sceneId}
      index={index}
      videoId={videoId}
      element={element}
      inline
      size={isNestedImage(element) ? 'small' : undefined}
      scale={isNestedImage(element) ? NESTED_IMAGE_SCALE : undefined}
      fontSize={isNestedText(element) ? NESTED_FONT_SIZE : undefined}
      textAlign="center"
    />
  );
};

export const NestedZoomLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { container, nested, outer } = getNestedZoomLayoutParts(scene);

  const enter = spring({
    frame,
    fps,
    durationInFrames: NESTED_ENTRY_FRAMES,
    config: SOFT_SPRING,
  });
  const zoomSpring = spring({
    frame: Math.max(0, frame - NESTED_ENTRY_FRAMES),
    fps,
    durationInFrames: NESTED_ZOOM_FRAMES,
    config: SOFT_SPRING,
  });

  const enterScale = interpolate(enter, [0, 1], [NESTED_ENTRY_FROM, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cameraScale = interpolate(zoomSpring, [0, 1], [1, NESTED_ZOOM], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const screenCover = interpolate(zoomSpring, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <NestedInkFilter />

      {outer.map((element, index) => (
        <TimedElement
          key={`${scene.id}-outer-${index}`}
          sceneId={scene.id}
          index={200 + index}
          videoId={videoId}
          element={element}
          characterPosition={
            element.type === 'character' ? 'bottom_right' : undefined
          }
        />
      ))}

      <div style={NESTED_STAGE_STYLE}>
        <div
          style={{
            transform: `scale(${enterScale})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            className="ink-roughness"
            style={{
              ...NESTED_FRAME_WRAP_STYLE,
              transform: `scale(${cameraScale})`,
              transformOrigin: `${NESTED_SCREEN_ORIGIN.x * 100}% ${NESTED_SCREEN_ORIGIN.y * 100}%`,
              filter: `url(#${ROUGHNESS_FILTER_ID})`,
            }}
          >
            <TimedElement
              sceneId={scene.id}
              index={0}
              videoId={videoId}
              element={container}
              inline
              position="center"
              size={container.size}
            />

            <div
              className="ink-roughness"
              style={NESTED_SCREEN_STYLE}
            >
              <div
                style={{
                  ...NESTED_SCREEN_COVER_STYLE,
                  opacity: screenCover,
                  boxShadow: `inset 0 0 0 3px ${NESTED_INK_COLOR}`,
                }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: nested.some(isNestedCharacter)
                    ? 'flex-start'
                    : 'center',
                  paddingTop: nested.some(isNestedCharacter) ? 16 : 0,
                  gap: 10,
                  mixBlendMode: 'multiply',
                  boxSizing: 'border-box',
                }}
              >
                {nested
                  .filter((element) => !isNestedCharacter(element))
                  .map((element, index) => (
                    <NestedItem
                      key={`${scene.id}-nested-${index}`}
                      videoId={videoId}
                      sceneId={scene.id}
                      index={10 + index}
                      element={element}
                    />
                  ))}
              </div>

              {nested.filter(isNestedCharacter).map((element, index) => (
                <div
                  key={`${scene.id}-nested-char-${index}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    transform: 'scale(0.72)',
                    transformOrigin: 'center bottom',
                    mixBlendMode: 'multiply',
                  }}
                >
                  <TimedElement
                    sceneId={scene.id}
                    index={50 + index}
                    videoId={videoId}
                    element={element}
                    characterPosition="bottom_center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
