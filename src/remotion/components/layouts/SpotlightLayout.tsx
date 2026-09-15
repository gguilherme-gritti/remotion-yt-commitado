import type { FC } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { SceneElement } from '../../../types/scene';
import { SOFT_SPRING } from '../../utils/motion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  SPOTLIGHT_CHARACTER_STYLE,
  SPOTLIGHT_DIM_GRAYSCALE,
  SPOTLIGHT_DIM_OPACITY,
  SPOTLIGHT_DIM_SCALE,
  SPOTLIGHT_PUNCH_ZOOM,
  SPOTLIGHT_ROW_SLOT_STYLE,
  SPOTLIGHT_ROW_STYLE,
  SPOTLIGHT_STAGE_STYLE,
  SPOTLIGHT_TARGET_SCALE,
  SPOTLIGHT_TITLE_FONT_SIZE,
  SPOTLIGHT_TITLE_STYLE,
  getSpotlightLayoutParts,
  isSpotlightTarget,
  isSpotlightText,
} from '../defaults/spotlightDefaults';

function spotlightDimStyle(dim: number, focused: boolean) {
  const opacity = focused
    ? 1
    : interpolate(dim, [0, 1], [1, SPOTLIGHT_DIM_OPACITY], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
  const scale = focused
    ? interpolate(dim, [0, 1], [1, SPOTLIGHT_TARGET_SCALE], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : interpolate(dim, [0, 1], [1, SPOTLIGHT_DIM_SCALE], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
  const grayscale = focused
    ? 0
    : interpolate(dim, [0, 1], [0, SPOTLIGHT_DIM_GRAYSCALE], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return { opacity, scale, grayscale };
}

const SpotlightTitle: FC<{
  videoId: string;
  sceneId: string;
  index: number;
  element: SceneElement;
  dim: number;
  focused: boolean;
}> = ({ videoId, sceneId, index, element, dim, focused }) => {
  const { opacity, scale, grayscale } = spotlightDimStyle(dim, focused);

  return (
    <div
      style={{
        ...SPOTLIGHT_TITLE_STYLE,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center top',
        filter: grayscale > 0.5 ? `grayscale(${grayscale}%)` : undefined,
      }}
    >
      <TimedElement
        sceneId={sceneId}
        index={index}
        videoId={videoId}
        element={element}
        inline
        textAlign="center"
        fontSize={SPOTLIGHT_TITLE_FONT_SIZE}
      />
    </div>
  );
};

const SpotlightRowItem: FC<{
  videoId: string;
  sceneId: string;
  index: number;
  element: SceneElement;
  dim: number;
  focused: boolean;
}> = ({ videoId, sceneId, index, element, dim, focused }) => {
  const { opacity, scale, grayscale } = spotlightDimStyle(dim, focused);

  return (
    <div
      style={{
        ...SPOTLIGHT_ROW_SLOT_STYLE,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        filter: grayscale > 0.5 ? `grayscale(${grayscale}%)` : undefined,
        mixBlendMode: 'multiply',
        zIndex: focused ? 6 : 4,
      }}
    >
      <TimedElement
        sceneId={sceneId}
        index={index}
        videoId={videoId}
        element={element}
        inline
      />
    </div>
  );
};

export const SpotlightLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { target, texts, characters, row, highlightAt, punchFrames, focus } =
    getSpotlightLayoutParts(scene);

  const dim = spring({
    frame: Math.max(0, frame - highlightAt),
    fps,
    durationInFrames: punchFrames,
    config: SOFT_SPRING,
  });
  const punch = interpolate(dim, [0, 1], [1, SPOTLIGHT_PUNCH_ZOOM], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const targetIsText = isSpotlightText(target);

  return (
    <AbsoluteFill>
      <div
        style={{
          ...SPOTLIGHT_STAGE_STYLE,
          transform: `scale(${punch})`,
          transformOrigin: `${focus.x * 100}% ${focus.y * 100}%`,
        }}
      >
        <div>
          {texts.map((element, index) => (
            <SpotlightTitle
              key={`${scene.id}-title-${index}`}
              videoId={videoId}
              sceneId={scene.id}
              index={index + 1}
              element={element}
              dim={dim}
              focused={false}
            />
          ))}
          {targetIsText ? (
            <SpotlightTitle
              videoId={videoId}
              sceneId={scene.id}
              index={0}
              element={target}
              dim={dim}
              focused
            />
          ) : null}
        </div>

        <div style={SPOTLIGHT_ROW_STYLE}>
          {row.map((element, index) => (
            <SpotlightRowItem
              key={`${scene.id}-row-${index}`}
              videoId={videoId}
              sceneId={scene.id}
              index={index + 20}
              element={element}
              dim={dim}
              focused={isSpotlightTarget(element)}
            />
          ))}
        </div>

        {characters.map((element, index) => {
          const focused = isSpotlightTarget(element);
          const { opacity, scale, grayscale } = spotlightDimStyle(dim, focused);
          const pinnedLeft =
            (element.position ?? 'bottom_left') === 'bottom_left';

          if (pinnedLeft) {
            return (
              <div
                key={`${scene.id}-character-${index}`}
                style={{
                  ...SPOTLIGHT_CHARACTER_STYLE,
                  opacity,
                  transform: `scale(${scale})`,
                  transformOrigin: 'left bottom',
                  filter:
                    grayscale > 0.5 ? `grayscale(${grayscale}%)` : undefined,
                }}
              >
                <TimedElement
                  sceneId={scene.id}
                  index={200 + index}
                  videoId={videoId}
                  element={element}
                  inline
                  characterPosition="bottom_left"
                />
              </div>
            );
          }

          return (
            <TimedElement
              key={`${scene.id}-character-${index}`}
              sceneId={scene.id}
              index={200 + index}
              videoId={videoId}
              element={element}
              characterPosition={element.position}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
