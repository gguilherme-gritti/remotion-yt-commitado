import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  BALLOON_CHARACTER_SHIFT_PX,
  BALLOON_INNER_FONT_SIZE,
  BALLOON_INNER_IMAGE_SCALE,
  BALLOON_INNER_STYLE,
  BALLOON_LIFT_PX,
  BALLOON_STRETCH_X,
  getBalloonLayoutParts,
} from './balloonDefaults';

export const BalloonLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const { characters, balloon, inner } = getBalloonLayoutParts(scene);

  return (
    <AbsoluteFill>
      {characters.map((element, index) => (
        <div
          key={`${scene.id}-char-${index}`}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            transform: `translateX(${BALLOON_CHARACTER_SHIFT_PX}px)`,
          }}
        >
          <TimedElement
            sceneId={scene.id}
            index={index}
            videoId={videoId}
            element={element}
            characterPosition="bottom_left"
          />
        </div>
      ))}

      {balloon ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            transform: `translateY(${BALLOON_LIFT_PX}px) scaleX(${BALLOON_STRETCH_X})`,
            transformOrigin: 'center top',
          }}
        >
          <TimedElement
            sceneId={scene.id}
            index={0}
            videoId={videoId}
            element={balloon}
            position="top_center"
            size={balloon.size ?? 'hero'}
          />
        </div>
      ) : null}

      <div style={BALLOON_INNER_STYLE}>
        {inner.map((element, index) => (
          <TimedElement
            key={`${scene.id}-inner-${index}`}
            sceneId={scene.id}
            index={index + 10}
            videoId={videoId}
            element={element}
            inline
            size={element.type === 'image' ? 'small' : undefined}
            scale={element.type === 'image' ? BALLOON_INNER_IMAGE_SCALE : undefined}
            fontSize={element.type === 'text' ? BALLOON_INNER_FONT_SIZE : undefined}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
