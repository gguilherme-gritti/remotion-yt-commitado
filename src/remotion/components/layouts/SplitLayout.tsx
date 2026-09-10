import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { SceneElement } from '../../../types/scene';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  SPLIT_COLUMN_STYLE,
  SPLIT_IMAGE_SLOT_STYLE,
  SPLIT_LABEL_FONT_SIZE,
  SPLIT_LABEL_SLOT_STYLE,
  SPLIT_STAGE_STYLE,
  getSplitLayoutParts,
} from './splitDefaults';

const SplitColumn: FC<{
  videoId: string;
  sceneId: string;
  indexOffset: number;
  elements: SceneElement[];
}> = ({ videoId, sceneId, indexOffset, elements }) => {
  return (
    <div style={SPLIT_COLUMN_STYLE}>
      {elements.map((element, index) => (
        <div
          key={`${sceneId}-slot-${indexOffset + index}`}
          style={
            element.type === 'image' ? SPLIT_IMAGE_SLOT_STYLE : SPLIT_LABEL_SLOT_STYLE
          }
        >
          <TimedElement
            sceneId={sceneId}
            index={indexOffset + index}
            videoId={videoId}
            element={element}
            inline
            size={element.type === 'image' ? 'medium' : undefined}
            fontSize={element.type === 'text' ? SPLIT_LABEL_FONT_SIZE : undefined}
            textAlign="center"
          />
        </div>
      ))}
    </div>
  );
};

export const SplitLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const { character, left, right } = getSplitLayoutParts(scene);

  return (
    <AbsoluteFill>
      <TimedElement
        sceneId={scene.id}
        index={100}
        videoId={videoId}
        element={character}
        characterPosition="bottom_right"
      />

      <div style={SPLIT_STAGE_STYLE}>
        <SplitColumn
          videoId={videoId}
          sceneId={scene.id}
          indexOffset={0}
          elements={left}
        />
        <SplitColumn
          videoId={videoId}
          sceneId={scene.id}
          indexOffset={20}
          elements={right}
        />
      </div>
    </AbsoluteFill>
  );
};
