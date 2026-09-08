import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  LIST_CHARACTER_SCALE,
  LIST_COLUMN_STYLE,
  LIST_ITEM_FONT_SIZE,
  LIST_ITEM_IMAGE_SCALE,
  LIST_SPACER_STYLE,
  LIST_STAGE_STYLE,
  getListLayoutParts,
} from './listDefaults';

export const ConditionalListLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const { character, items } = getListLayoutParts(scene);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${LIST_CHARACTER_SCALE})`,
          transformOrigin: 'center center',
        }}
      >
        <TimedElement
          sceneId={scene.id}
          index={0}
          videoId={videoId}
          element={character}
          characterPosition="center"
        />
      </div>

      <div style={LIST_STAGE_STYLE}>
        <div style={{ ...LIST_COLUMN_STYLE, alignItems: 'flex-start' }}>
          {items.map((item, index) =>
            item.text ? (
              <TimedElement
                key={`${scene.id}-text-${index}`}
                sceneId={scene.id}
                index={index}
                videoId={videoId}
                element={item.text}
                inline
                fontSize={LIST_ITEM_FONT_SIZE}
                textAlign="left"
              />
            ) : (
              <div key={`${scene.id}-text-slot-${index}`} />
            ),
          )}
        </div>

        <div style={LIST_SPACER_STYLE} />

        <div style={{ ...LIST_COLUMN_STYLE, alignItems: 'flex-end' }}>
          {items.map((item, index) =>
            item.image ? (
              <TimedElement
                key={`${scene.id}-img-${index}`}
                sceneId={scene.id}
                index={index + 20}
                videoId={videoId}
                element={item.image}
                inline
                size="small"
                scale={LIST_ITEM_IMAGE_SCALE}
              />
            ) : (
              <div key={`${scene.id}-img-slot-${index}`} />
            ),
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
